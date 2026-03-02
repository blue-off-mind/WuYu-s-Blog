import type { Article } from "@/lib/types";
import heroImg from "@/assets/image_w1376_h768_hero_workspace_morning.jpeg";
import techImg from "@/assets/image_w928_h1152_tech_abstract_code.jpeg";
import designImg from "@/assets/image_w928_h1152_design_architecture_bw.jpeg";
import lifestyleImg from "@/assets/image_w928_h1152_lifestyle_reading_window.jpeg";
import musicImg from "@/assets/image_w928_h1152_music_vinyl_texture.jpeg";

export const SEED_ARTICLES: Article[] = [
  {
    id: "1",
    title: "The Architecture of Silence",
    author: "Elena Fisher",
    category: "Design",
    mood: "Deep Focus",
    publishedAt: new Date().toISOString(),
    imageUrl: designImg,
    editorNote: "Why minimalist brutalism matters in a noisy digital world.",
    bestContext: "Quiet afternoon",
    pullQuote: "Silence isn't empty. It's full of answers.",
    content: `
      <p>In a world screaming for attention, brutalism whispers. It stands as a testament to the raw, the unpolished, and the honest. This architectural style, often misunderstood as cold, is actually deeply human.</p>
      <p>It exposes the skeleton of the building—the concrete, the steel, the structural integrity—without masking it in decorative falsehoods. In design, we often try to hide the mechanics, but brutalism celebrates them.</p>
      <p>When we apply this to digital interfaces, we strip away the gradients and the drop shadows. We leave only what is necessary: the content, the grid, and the typography. This is the architecture of silence.</p>
    `,
    isFeatured: true,
    likes: 124,
  },
  {
    id: "2",
    title: "Syntax & Solitude",
    author: "Marcus Chen",
    category: "Coding",
    mood: "Late Night",
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    imageUrl: techImg,
    editorNote: "Coding is the closest thing we have to modern-day wizardry.",
    bestContext: "Midnight coding session",
    pullQuote: "Code is poetry written for machines.",
    content: `
      <p>There is a specific kind of peace that descends at 2 AM. The world is asleep, the notifications have stopped, and it's just you and the terminal.</p>
      <p>The blinking cursor is a heartbeat. Every function written is a spell cast into the void, waiting for a response. The logic flows like water, finding the path of least resistance through the complex landscape of the application state.</p>
      <p>We build castles in the air, structures of pure logic that support the weight of human interaction. It is solitary work, but it connects the world.</p>
    `,
    likes: 89,
  },
  {
    id: "3",
    title: "Sunday Morning Rituals",
    author: "Sarah James",
    category: "Life",
    mood: "Sunday Morning",
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    imageUrl: heroImg,
    editorNote: "Slow living isn't a trend; it's a necessity.",
    bestContext: "With coffee",
    pullQuote: "Reclaim your time, one slow morning at a time.",
    content: `
      <p>The light hits the desk differently on a Sunday. It's softer, less demanding. The urgency of the week dissolves into the steam rising from a cup of black coffee.</p>
      <p>This is the time to open a notebook, not a laptop. To write with a pen, to feel the friction of ink on paper. It's a tactile experience in a glass-screen world.</p>
      <p>These rituals ground us. They remind us that we are physical beings, not just minds floating in the cloud. Take this moment. Own it.</p>
    `,
    likes: 215,
  },
  {
    id: "4",
    title: "Analog Sound in a Digital Age",
    author: "David Bowie (Spirit)",
    category: "Music",
    mood: "Nostalgic",
    publishedAt: new Date(Date.now() - 250000000).toISOString(),
    imageUrl: musicImg,
    editorNote: "Why we return to vinyl when Spotify has everything.",
    bestContext: "Evening chill",
    pullQuote: "Fidelity is about feeling, not just frequency.",
    content: `
      <p>The crackle is part of the song. It's the sound of time passing, of a needle physically tracing a groove carved into plastic.</p>
      <p>Streaming is convenient, but vinyl is intentional. You have to stand up, choose the record, take it out of the sleeve, and place the needle. You are participating in the music.</p>
      <p>It forces you to listen to an album as a complete thought, not just a shuffled playlist of hits. It respects the artist's narrative.</p>
    `,
    likes: 67,
  },
  {
    id: "5",
    title: "The Light at the Window",
    author: "Jessica Lee",
    category: "Life",
    mood: "Sunday Morning",
    publishedAt: new Date(Date.now() - 300000000).toISOString(),
    imageUrl: lifestyleImg,
    editorNote: "Finding peace in the corners of your home.",
    bestContext: "Afternoon break",
    pullQuote: "Light shapes our mood more than we realize.",
    content: `
      <p>Architecture is the manipulation of light. But so is our daily life. Where we sit, where we read, where we think—it all depends on the light.</p>
      <p>A window is a frame for the world outside, but it also paints the world inside. The golden hour casts long shadows that stretch across the floor, measuring the day.</p>
      <p>Find your corner. Let the light find you.</p>
    `,
    likes: 42,
  },
  {
    id: "6",
    title: "Deep Work Protocols",
    author: "Cal Newport (Fan)",
    category: "Tech",
    mood: "Deep Focus",
    publishedAt: new Date(Date.now() - 400000000).toISOString(),
    imageUrl: techImg,
    editorNote: "How to focus without burning out.",
    bestContext: "Productivity sprint",
    pullQuote: "Focus is the new IQ.",
    content: `
      <p>Distraction is the default state of the modern mind. We are constantly pinged, buzzed, and notified. To do deep work is an act of rebellion.</p>
      <p>It requires boundaries. It requires the courage to be unavailable. It requires a system that protects your attention as your most valuable resource.</p>
      <p>Turn off the phone. Close the tabs. Do the work that matters.</p>
    `,
    likes: 156,
  },
];
