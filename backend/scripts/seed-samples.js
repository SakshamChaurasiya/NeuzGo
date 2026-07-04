/**
 * seed-samples.js
 *
 * Seeds sample users and blogs in different states (Draft, Pending, Approved, Rejected)
 * for testing the blog system dashboard and feed.
 *
 * Usage: node scripts/seed-samples.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/user.model");
const Blog = require("../src/models/blogs.model");

const SAMPLE_USERS = [
  {
    username: "Jane Doe",
    email: "jane@example.com",
    phoneNumber: "9876543221",
    password: "password123",
  },
  {
    username: "Alex Smith",
    email: "alex@example.com",
    phoneNumber: "9876543222",
    password: "password123",
  }
];

const SAMPLE_BLOGS = [
  {
    title: "Exploring the Future of Web Development with Vite and React",
    description: "An in-depth analysis of next-generation build tools and UI frameworks.",
    content: "Web development is moving faster than ever. Tools like Vite have completely replaced older bundlers by leveraging native ES modules. In this article, we look at performance benchmarks, HMR speed, and integration strategies for React developers looking to maximize their workflow efficiency.\n\nKey takeaways include:\n1. Fast refresh defaults\n2. Optimizing chunk structures\n3. Micro frontend scaling.",
    category: "Technology",
    tags: ["tech", "react", "vite", "programming"],
    status: "Approved",
    imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop&q=60",
    views: 124,
    likes: 42,
  },
  {
    title: "Understanding Modern Business Strategies in a Digital Age",
    description: "How legacy companies are adapting to SaaS, AI integration, and cloud migrations.",
    content: "The landscape of modern enterprise business is shifting toward intelligent automation. Organizations that fail to integrate machine learning workflows into customer service and supply chain logistics risk falling behind. This article reviews case studies of companies that successfully digitized their business models over the last 18 months.",
    category: "Business",
    tags: ["business", "saas", "finance"],
    status: "Pending",
    imageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "A Complete Guide to Mindful Eating and Clean Nutrition",
    description: "Simple, evidence-based nutrition tips to sustain high daily cognitive energy levels.",
    content: "Clean nutrition starts with whole foods. Eliminating highly processed sugars reduces systemic inflammation and balances blood glucose peaks, preventing the afternoon slump. Here, we outline a 5-step checklist for building a sustainable nutritional routine that maximizes focus and physical vitality.",
    category: "Health",
    tags: ["health", "diet", "lifestyle"],
    status: "Draft",
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "The Ultimate Guide to Sports Recovery Protocols",
    description: "Scientific strategies for muscle recovery, including hot-cold therapy and sleep optimization.",
    content: "Recovery is just as important as the workout. Without adequate rest, cortisol levels spike, suppressing immune function and muscle synthesis. We review the latest physical therapy literature on active recovery versus passive rest.",
    category: "Sports",
    tags: ["sports", "fitness", "health"],
    status: "Rejected",
    rejectionReason: "Title is too generic. Please provide more detailed data on protocols.",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "10 Nutrition Tips for Peak Cognitive Performance",
    description: "How what you eat affects your focus, concentration, and long-term memory.",
    content: "Cognitive performance is deeply tied to nutritional intake. Balancing omega-3 fatty acids, staying hydrated with clean water, and consuming low-glycemic foods can prevent productivity-killing brain fog. Let's look at the scientific consensus on diet and focus.",
    category: "Health",
    tags: ["health", "diet", "productivity"],
    status: "Approved",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "The Evolution of Global Esports and Modern Sports Culture",
    description: "Esports is no longer a niche hobby. It is a multi-billion dollar athletic industry.",
    content: "With millions of viewers tuning in to championship events globally, competitive gaming has earned its place among major mainstream sporting structures. We review revenue models, training regimens, and athletic endorsements.",
    category: "Sports",
    tags: ["sports", "esports", "gaming"],
    status: "Approved",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "Demystifying Artificial Intelligence: Beyond the Hype",
    description: "What AI can and cannot do for your team's software development pipeline.",
    content: "Large Language Models are excellent code writing assistants, but they do not replace architectural design or software security practices. We examine realistic ways to integrate LLMs into your current workflow.",
    category: "Technology",
    tags: ["tech", "ai", "coding"],
    status: "Approved",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "Scaling a SaaS Startup: Zero to Product-Market Fit",
    description: "Essential lessons in bootstrapping, metrics alignment, and customer retention.",
    content: "Achieving product-market fit is the hardest stage of any startup. This guide covers how to run rapid feedback loops, build MVP feature sets, and optimize your customer acquisition cost (CAC) versus customer lifetime value (LTV).",
    category: "Business",
    tags: ["business", "saas", "startup"],
    status: "Approved",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "Navigating the New Political Landscape in Global Trade",
    description: "How tariff adjustments and international agreements affect supply chains.",
    content: "Global logistics have become highly complex over the past year. Supply chain leaders must establish multi-regional redundancies to mitigate political risks and cross-border trade disruptions.",
    category: "Politics",
    tags: ["politics", "trade", "economics"],
    status: "Approved",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "Why Cinema is Entering a New Golden Age of Independent Film",
    description: "Streaming services and lower barrier to entry equipment are elevating new directors.",
    content: "Indie filmmakers are gaining massive traction at international festivals. Digital distribution networks allow unique cultural narratives to reach global audiences without massive studio backing.",
    category: "Entertainment",
    tags: ["entertainment", "cinema", "movies"],
    status: "Approved",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=60",
  }
];

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing from environment variables.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Create Users
  const createdUsers = [];
  const salt = await bcrypt.genSalt(10);

  for (const u of SAMPLE_USERS) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      const hashedPassword = await bcrypt.hash(u.password, salt);
      user = new User({
        username: u.username,
        email: u.email,
        phoneNumber: u.phoneNumber,
        password: hashedPassword,
      });
      await user.save();
      console.log(`👤 Created user: ${u.username}`);
    } else {
      console.log(`👤 User already exists: ${u.username}`);
    }
    createdUsers.push(user);
  }

  // Create Blogs linked to seeded users
  for (let i = 0; i < SAMPLE_BLOGS.length; i++) {
    const blogData = SAMPLE_BLOGS[i];
    // Alternate authors
    const author = createdUsers[i % createdUsers.length];

    const slug = blogData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check if blog already exists by slug
    let blog = await Blog.findOne({ slug });
    if (!blog) {
      blog = new Blog({
        ...blogData,
        author: author._id,
        slug,
        submittedAt: blogData.status !== "Draft" ? new Date() : undefined,
        publishedAt: blogData.status === "Approved" ? new Date() : undefined,
      });
      await blog.save();
      console.log(`📝 Seeded blog [${blogData.status}]: "${blogData.title}"`);
    } else {
      console.log(`📝 Blog already exists: "${blogData.title}"`);
    }
  }

  await mongoose.disconnect();
  console.log("✅ Seeding completed successfully.");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err.message);
  process.exit(1);
});
