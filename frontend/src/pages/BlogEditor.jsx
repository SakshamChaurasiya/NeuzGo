import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave, FiSend, FiArrowLeft, FiImage, FiEye, FiEdit3, FiUpload } from "react-icons/fi";
import apiClient from "../api/client";
import toast from "react-hot-toast";

const CATEGORIES = ["General", "Technology", "Health", "Business", "Sports", "Politics", "Entertainment"];

const PRESETS = [
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=60",
];

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("General");
  const [tagsInput, setTagsInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [activeTab, setActiveTab] = useState("edit"); // edit vs preview

  const [imageSource, setImageSource] = useState("url"); // "url" | "upload"
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Get authentication parameters from backend
      const authRes = await apiClient.get("/blogs/imagekit-auth");
      if (!authRes.data?.success) {
        throw new Error("Failed to retrieve upload parameters");
      }
      const { token, expire, signature, publicKey } = authRes.data.data;

      // Prepare payload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `blog_${Date.now()}_${file.name}`);
      formData.append("publicKey", publicKey);
      formData.append("signature", signature);
      formData.append("expire", expire);
      formData.append("token", token);

      // Upload to ImageKit
      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Upload to ImageKit failed");
      }

      const data = await response.json();
      setImageUrl(data.url);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload image. Verify ImageKit configuration.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      const fetchBlogDetails = async () => {
        setFetching(true);
        try {
          // Since getMyBlogs takes a status, we can request our blogs and filter on client or create a single details route.
          // Let's call /api/blogs/my-blogs and look for our blog.
          const res = await apiClient.get("/blogs/my-blogs");
          if (res.data?.success) {
            const blog = res.data.data.find((b) => b._id === id);
            if (blog) {
              // Try to load unsaved draft from localStorage first
              const savedDraft = localStorage.getItem(`blog_draft_${id}`);
              if (savedDraft) {
                const parsed = JSON.parse(savedDraft);
                setTitle(parsed.title || "");
                setDescription(parsed.description || "");
                setContent(parsed.content || "");
                setImageUrl(parsed.imageUrl || "");
                setCategory(parsed.category || "General");
                setTagsInput(parsed.tagsInput || "");
                toast.success("Restored unsaved draft changes from browser.");
              } else {
                setTitle(blog.title || "");
                setDescription(blog.description || "");
                setContent(blog.content || "");
                setImageUrl(blog.imageUrl || "");
                setCategory(blog.category || "General");
                setTagsInput(blog.tags ? blog.tags.join(", ") : "");
              }
            } else {
              toast.error("Blog not found or unauthorized.");
              navigate("/profile");
            }
          }
        } catch (err) {
          console.error(err);
          toast.error("Error loading blog details.");
        } finally {
          setFetching(false);
        }
      };
      fetchBlogDetails();
    } else {
      // If not edit mode, check for blog_draft_new
      const savedDraft = localStorage.getItem("blog_draft_new");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setTitle(parsed.title || "");
        setDescription(parsed.description || "");
        setContent(parsed.content || "");
        setImageUrl(parsed.imageUrl || "");
        setCategory(parsed.category || "General");
        setTagsInput(parsed.tagsInput || "");
        toast.success("Restored unsaved draft from browser.");
      }
    }
  }, [id, isEditMode, navigate]);

  // Autosave changes to localStorage
  useEffect(() => {
    if (fetching) return;

    // Avoid saving completely empty initial state
    if (!title && !description && !content && !imageUrl && !tagsInput) return;

    const draftData = {
      title,
      description,
      content,
      imageUrl,
      category,
      tagsInput,
    };

    const key = isEditMode ? `blog_draft_${id}` : "blog_draft_new";
    localStorage.setItem(key, JSON.stringify(draftData));
  }, [title, description, content, imageUrl, category, tagsInput, id, isEditMode, fetching]);

  const handleSave = async (submitAfterSave = false) => {
    if (!title.trim() || !description.trim() || !content.trim()) {
      toast.error("Title, short description, and content are required.");
      return null;
    }

    setLoading(true);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const blogData = {
      title,
      description,
      content,
      imageUrl: imageUrl || PRESETS[0],
      category,
      tags,
    };

    try {
      let savedBlog = null;
      if (isEditMode) {
        const response = await apiClient.put(`/blogs/${id}`, blogData);
        if (response.data?.success) {
          savedBlog = response.data.data;
        }
      } else {
        const response = await apiClient.post("/blogs/draft", blogData);
        if (response.data?.success) {
          savedBlog = response.data.data;
        }
      }

      if (savedBlog) {
        // Clear drafts from localStorage
        const key = isEditMode ? `blog_draft_${id}` : "blog_draft_new";
        localStorage.removeItem(key);
        if (!isEditMode) {
          localStorage.removeItem("blog_draft_new");
        }

        if (submitAfterSave) {
          const submitResponse = await apiClient.post(`/blogs/${savedBlog._id}/submit`);
          if (submitResponse.data?.success) {
            toast.success("Blog submitted for review successfully!");
            navigate("/profile");
            return;
          }
        }
        toast.success(isEditMode ? "Blog updated successfully!" : "Draft saved successfully!");
        if (!isEditMode) {
          navigate(`/blogs/edit/${savedBlog._id}`);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save blog draft.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-4 animate-pulse">
        <div className="h-8 bg-charcoal-100 rounded w-1/4"></div>
        <div className="h-64 bg-charcoal-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-charcoal-100 pb-4 sm:pb-0 sm:border-b-0">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-sm font-semibold text-charcoal-600 hover:text-charcoal-900 transition-colors py-2 touch-manipulation"
        >
          <FiArrowLeft className="h-4 w-4" /> Back to Profile
        </button>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => handleSave(false)}
            disabled={loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 border border-charcoal-200 rounded-lg text-xs sm:text-sm font-semibold text-charcoal-700 bg-white hover:bg-charcoal-50 transition-all disabled:opacity-50 touch-manipulation"
          >
            <FiSave className="h-4 w-4" /> Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm hover:shadow disabled:opacity-50 touch-manipulation"
          >
            <FiSend className="h-4 w-4" /> Submit
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="bg-white border border-charcoal-100 rounded-xl shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-charcoal-100 bg-charcoal-50/50 px-2 sm:px-4">
          <button
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all touch-manipulation ${
              activeTab === "edit"
                ? "border-charcoal-900 text-charcoal-900"
                : "border-transparent text-charcoal-500 hover:text-charcoal-800"
            }`}
          >
            <FiEdit3 className="h-4 w-4" /> Write
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all touch-manipulation ${
              activeTab === "preview"
                ? "border-charcoal-900 text-charcoal-900"
                : "border-transparent text-charcoal-500 hover:text-charcoal-800"
            }`}
          >
            <FiEye className="h-4 w-4" /> Live Preview
          </button>
        </div>

        {activeTab === "edit" ? (
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500">Title</label>
              <input
                type="text"
                placeholder="Enter a compelling title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-charcoal-200 rounded-lg text-base sm:text-lg font-bold text-charcoal-900 focus:outline-none focus:border-charcoal-900 transition-colors touch-manipulation"
              />
            </div>

            {/* Grid for Cover Image, Category, Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><FiImage className="h-3.5 w-3.5" /> Cover Image</span>
                  <span className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setImageSource("url")}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition-all touch-manipulation ${
                        imageSource === "url"
                          ? "bg-charcoal-900 text-white"
                          : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"
                      }`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSource("upload")}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition-all touch-manipulation ${
                        imageSource === "upload"
                          ? "bg-charcoal-900 text-white"
                          : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"
                      }`}
                    >
                      Upload
                    </button>
                  </span>
                </label>

                {imageSource === "url" ? (
                  <>
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:border-charcoal-900 transition-colors touch-manipulation"
                    />
                    <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
                      <span className="text-[10px] text-charcoal-400 font-bold self-center">Presets:</span>
                      {PRESETS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImageUrl(p)}
                          className="text-[10px] font-semibold text-indigo-600 hover:underline py-1 touch-manipulation"
                        >
                          Image {idx + 1}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="relative border border-dashed border-charcoal-200 rounded-lg p-4 flex flex-col items-center justify-center bg-charcoal-50/50 hover:bg-charcoal-50 transition-colors h-[80px]">
                    {uploading ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-charcoal-500 font-semibold">Uploading to ImageKit...</span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center text-center">
                          <FiUpload className="h-5 w-5 text-charcoal-400 mb-1" />
                          <span className="text-xs font-semibold text-charcoal-600">Click to upload cover image</span>
                          <span className="text-[9px] text-charcoal-400">Supports PNG, JPG, JPEG, WEBP</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {imageUrl && !uploading && (
                  <div className="text-[10px] text-emerald-600 font-semibold mt-1 truncate">
                    ✓ Image source set: {imageUrl}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:border-charcoal-900 transition-colors bg-white font-semibold text-charcoal-800 touch-manipulation"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500">Tags</label>
                  <input
                    type="text"
                    placeholder="tech, news, space"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:border-charcoal-900 transition-colors touch-manipulation"
                  />
                </div>
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500">Short Description</label>
              <textarea
                rows={2}
                placeholder="Write a brief, catchy summary of the blog post..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 border border-charcoal-200 rounded-lg text-sm text-charcoal-700 focus:outline-none focus:border-charcoal-900 transition-colors resize-none touch-manipulation"
              />
            </div>

            {/* Blog Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500">Blog Content</label>
              <textarea
                rows={12}
                placeholder="Write your story here... Feel free to use Markdown formatting."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 border border-charcoal-200 rounded-lg text-sm text-charcoal-800 font-mono focus:outline-none focus:border-charcoal-900 transition-colors touch-manipulation"
              />
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Preview Cover Image */}
            {imageUrl && (
              <div className="relative aspect-[21/9] rounded-lg overflow-hidden border border-charcoal-100 bg-charcoal-50">
                <img src={imageUrl} alt="Cover Preview" className="object-cover w-full h-full" />
              </div>
            )}

            {/* Preview Metadata */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                  {category}
                </span>
                <span className="text-xs text-charcoal-400 font-bold uppercase tracking-wider">
                  {Math.max(1, Math.ceil((content ? content.split(/\s+/).length : 0) / 200))} MIN READ
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal-950 leading-tight">
                {title || "Untitled Blog Post"}
              </h1>
              <p className="text-charcoal-500 font-semibold text-sm italic">{description || "No description provided."}</p>
            </div>

            <hr className="border-charcoal-100" />

            {/* Preview Tags */}
            {tagsInput && (
              <div className="flex flex-wrap gap-1.5 pt-4">
                {tagsInput
                  .split(",")
                  .map((t) => t.trim())
                  .filter((t) => t.length > 0)
                  .map((t, idx) => (
                    <span key={idx} className="bg-charcoal-50 text-charcoal-600 px-2 py-0.5 rounded text-xs font-semibold">
                      #{t}
                    </span>
                  ))}
              </div>
            )}

            {/* Preview Content Body */}
            <div className="prose prose-charcoal max-w-none text-charcoal-800 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
              {content || "Start typing in the 'Write' tab to see content here."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogEditor;
