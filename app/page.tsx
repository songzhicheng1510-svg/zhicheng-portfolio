"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import Prism from "./components/Prism";
import Strands from "./components/Strands";

/*
THESIS: Lumora makes focus tangible as a moving world; it refuses the category’s dashboard-and-metrics hero.
OWN-WORLD: Full-bleed cinematic nature, restrained white/ink typography, and lens-like pill controls.
STORY: Noise recedes, the visitor chooses an atmosphere, understands the promise, and requests access.
FIRST VIEWPORT: Brand and navigation frame a centered manifesto; scene controls and quiet proof anchor the lower edge.
FORM: Immersive cinematic title sequence, the brief-pinned direction; no seed was needed for this precise specification.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
*/

const scenes = [
  {
    label: "Afterglow",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4",
    poster: "posters/afterglow.webp",
  },
  {
    label: "Stillness",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4",
    poster: "posters/stillness.webp",
  },
  {
    label: "Understory",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4",
    poster: "posters/understory.webp",
  },
  {
    label: "Daybreak",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4",
    poster: "posters/daybreak.webp",
  },
];

const stats = [
  ["Spatial", "Intelligence"],
  ["Generative", "Workflows"],
  ["Rhino", "Automation"],
  ["AIGC", "Visualization"],
];

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const projects = [
  {
    title: "AI-Assisted Building Massing",
    subtitle: "From design briefs to editable Rhino geometry",
    description:
      "A natural-language workflow that translates area, height, floor count, zoning, circulation, courtyard and core constraints into structured rules, then generates editable building massing with Rhino Python.",
    image: `${publicBasePath}/projects/massing-workflow.png`,
    imageAlt:
      "Experiment results showing Rhino Python generated building massing and corresponding plan layouts",
    details: ["Rhino Python", "Generative workflow", "CAADRIA research"],
  },
  {
    title: "Voice-Aided Rhino Modeling",
    subtitle: "A closed loop from speech to executable modeling scripts",
    description:
      "A voice and text driven modeling system connecting speech recognition, retrieval, LLM script generation and Rhino execution. Error capture and automatic repair keep complex modeling tasks traceable and recoverable.",
    image: `${publicBasePath}/projects/rhino-voice.png`,
    imageAlt:
      "System architecture for a voice aided Rhino modeling workflow",
    details: ["ASR + RAG + LLM", "Rhino automation", "SCI Q2 research"],
  },
  {
    title: "EditPanorama",
    subtitle: "AIGC interaction for interior renovation",
    description:
      "An indoor renovation visualization workflow combining panoramic input, prompt generation, localized editing and 360-degree presentation. It supports style changes, object replacement and controlled inpainting while preserving spatial continuity.",
    image: `${publicBasePath}/projects/editpanorama.png`,
    imageAlt:
      "EditPanorama results comparing original interiors with generated renovation styles",
    details: ["Stable Diffusion", "ControlNet", "CDRF research"],
  },
];

export default function Home() {
  const [activeVideo, setActiveVideo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isJourneying, setIsJourneying] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [autoCycle, setAutoCycle] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [loaderLeaving, setLoaderLeaving] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaderStartedAtRef = useRef<number | null>(null);
  const loaderFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaderExitRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaderRemoveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaderDismissedRef = useRef(false);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const progressRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const portfolioHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const portfolioRevealRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const portfolioFinishRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDarkScene = activeVideo === 2;

  const finishLoading = useCallback(() => {
    if (loaderDismissedRef.current) return;
    loaderDismissedRef.current = true;
    if (loaderFallbackRef.current) clearTimeout(loaderFallbackRef.current);

    const startedAt = loaderStartedAtRef.current ?? Date.now();
    loaderStartedAtRef.current = startedAt;
    const minimumDelay = Math.max(0, 450 - (Date.now() - startedAt));
    loaderExitRef.current = setTimeout(() => {
      try {
        sessionStorage.setItem("song-portfolio-loader-seen", "true");
      } catch {
        // The loader still exits when browser storage is unavailable.
      }
      setLoaderLeaving(true);
      loaderRemoveRef.current = setTimeout(() => setShowLoader(false), 350);
    }, minimumDelay);
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
      if (portfolioRevealRef.current) clearTimeout(portfolioRevealRef.current);
      if (portfolioFinishRef.current) clearTimeout(portfolioFinishRef.current);
    };
  }, []);

  useEffect(() => {
    const syncViewFromHistory = () => {
      const portfolioHashes = new Set(["#work", "#profile", "#selected-work"]);
      const shouldShowPortfolio = portfolioHashes.has(window.location.hash);
      setShowPortfolio(shouldShowPortfolio);
      setIsJourneying(false);
      if (shouldShowPortfolio) {
        setShowLoader(false);
        window.setTimeout(() => portfolioHeadingRef.current?.focus(), 0);
      }
    };

    syncViewFromHistory();
    window.addEventListener("popstate", syncViewFromHistory);
    return () => window.removeEventListener("popstate", syncViewFromHistory);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showPortfolio ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPortfolio]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("song-portfolio-loader-seen") === "true") {
        loaderDismissedRef.current = true;
        loaderRemoveRef.current = setTimeout(() => setShowLoader(false), 0);
        return () => {
          if (loaderRemoveRef.current) clearTimeout(loaderRemoveRef.current);
        };
      }
    } catch {
      // Continue with the loader when browser storage is unavailable.
    }

    loaderStartedAtRef.current = Date.now();
    loaderFallbackRef.current = setTimeout(finishLoading, 900);
    return () => {
      if (loaderFallbackRef.current) clearTimeout(loaderFallbackRef.current);
      if (loaderExitRef.current) clearTimeout(loaderExitRef.current);
      if (loaderRemoveRef.current) clearTimeout(loaderRemoveRef.current);
    };
  }, [finishLoading]);

  const selectVideo = (index: number, isManual = false) => {
    if (isManual) setAutoCycle(false);
    if (index === activeVideo || isTransitioning) return;
    const incoming = videoRefs.current[index];
    if (incoming) {
      incoming.currentTime = 0;
      void incoming.play();
    }
    const outgoing = activeVideo;
    setActiveVideo(index);
    setIsTransitioning(true);
    cooldownRef.current = setTimeout(() => {
      videoRefs.current[outgoing]?.pause();
      setIsTransitioning(false);
    }, 1000);
  };

  const revealPortfolio = () => {
    window.history.pushState({ view: "portfolio" }, "", "#work");
    setShowPortfolio(true);
    window.scrollTo({ top: 0, behavior: "auto" });
    window.setTimeout(() => portfolioHeadingRef.current?.focus(), 0);
  };

  const exploreProjects = () => {
    if (isJourneying) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealPortfolio();
      return;
    }

    setIsJourneying(true);
    portfolioRevealRef.current = setTimeout(revealPortfolio, 1840);
    portfolioFinishRef.current = setTimeout(() => setIsJourneying(false), 2240);
  };

  const returnToOpening = () => {
    window.history.pushState({ view: "opening" }, "", window.location.pathname);
    setActiveVideo(0);
    setAutoCycle(true);
    setShowPortfolio(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <main
      className={`lumora-shell ${showPortfolio ? "is-portfolio" : "is-opening"}`}
      aria-busy={showLoader || isJourneying}
    >
      {showLoader && (
        <div
          className={`site-loader ${loaderLeaving ? "is-leaving" : ""}`}
          role="status"
          aria-live="polite"
          aria-label="Loading Song Zhicheng portfolio"
        >
          <div className="site-loader-lockup">
            <span className="site-loader-name">Song Zhicheng</span>
            <span className="site-loader-role">portfolio</span>
            <span className="site-loader-track" aria-hidden="true">
              <span className="site-loader-progress" />
            </span>
          </div>
        </div>
      )}

      {!showPortfolio && (
      <section
        className={`hero ${isJourneying ? "is-journeying" : ""}`}
        aria-label="Zhicheng portfolio hero"
      >
        <div className="video-stack" aria-hidden="true">
          {scenes.map((scene, index) => (
            <video
              key={scene.label}
              ref={(node) => {
                videoRefs.current[index] = node;
              }}
              className={`scene-video ${activeVideo === index ? "is-active" : ""}`}
              autoPlay={index === 0}
              muted
              loop={!autoCycle && activeVideo === index}
              playsInline
              preload={index === 0 ? "auto" : "none"}
              poster={`${publicBasePath}/${scene.poster}`}
              onCanPlay={index === 0 ? finishLoading : undefined}
              onEnded={() => {
                if (autoCycle) selectVideo((index + 1) % scenes.length);
              }}
              onTimeUpdate={(event) => {
                const video = event.currentTarget;
                const progress =
                  Number.isFinite(video.duration) && video.duration > 0
                    ? video.currentTime / video.duration
                    : 0;
                progressRefs.current[index]?.style.setProperty(
                  "--scene-progress",
                  String(progress),
                );
              }}
            >
              <source src={scene.url} type="video/mp4" />
            </video>
          ))}
          <div className="cinematic-grade" />
        </div>

        <Image
          className="train-overlay"
          src={`${publicBasePath}/train-frame.webp`}
          alt=""
          fill
          priority
          unoptimized
        />

        <div className="content-layer">
          <header className="nav">
            <a href="#" className="logo" aria-label="Song Zhicheng portfolio home">
              <span>Song Zhicheng</span>
              <span>portfolio</span>
            </a>
          </header>

          <div className={`hero-copy ${isDarkScene ? "dark-scene" : ""}`}>
            <h1>
              Welcome to the world of
              <br />
              my portfolio.
            </h1>

            <button
              id="projects-cta"
              className="project-cta"
              type="button"
              onClick={exploreProjects}
              disabled={isJourneying}
              aria-label="Explore projects"
            >
              <span className="project-cta-label">
                Explore Projects <ArrowUpRight size={16} strokeWidth={1.8} />
              </span>
            </button>

            <div
              className="scene-switcher liquid-glass"
              role="group"
              aria-label="Choose a focus scene"
            >
              {scenes.map((scene, index) => (
                <button
                  key={scene.label}
                  type="button"
                  className={`${activeVideo === index ? "active" : ""} ${
                    !autoCycle && activeVideo === index ? "is-locked" : ""
                  }`}
                  aria-pressed={activeVideo === index}
                  disabled={isTransitioning && activeVideo !== index}
                  onClick={() => selectVideo(index, true)}
                >
                  <span className="scene-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="scene-name">{scene.label}</span>
                  <span
                    className="scene-progress"
                    aria-hidden="true"
                    ref={(node) => {
                      progressRefs.current[index] = node;
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div id="portfolio-focus" className="stats" aria-label="Portfolio focus areas">
            {stats.map(([value, label], index) => (
              <div className="stat-wrap" key={label}>
                <div className="stat">
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
                {index < stats.length - 1 && <span className="divider" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>

      </section>
      )}

      {showPortfolio && (
        <>
        <section className="portfolio-page" aria-label="Song Zhicheng portfolio">
          <header className="portfolio-nav">
            <button
              className="portfolio-wordmark"
              type="button"
              onClick={returnToOpening}
              aria-label="Return to opening"
            >
              <span>Song Zhicheng</span>
              <span>portfolio</span>
            </button>
            <nav aria-label="Portfolio sections">
              <a href="#profile">Profile</a>
              <a href="#selected-work">Projects</a>
            </nav>
          </header>

          <section className="portfolio-intro" id="profile">
            <div className="portfolio-prism" aria-hidden="true">
              <Prism
                animationType="3drotate"
                timeScale={0.22}
                height={3.5}
                baseWidth={5.5}
                scale={3.15}
                hueShift={-0.28}
                colorFrequency={0.85}
                noise={0.16}
                glow={0.82}
                bloom={0.88}
                offset={{ x: 100, y: 20 }}
                suspendWhenOffscreen
              />
            </div>
            <h1 ref={portfolioHeadingRef} tabIndex={-1}>
              Spatial intelligence,
              <br />
              built into real workflows.
            </h1>
            <div className="portfolio-intro-grid">
              <p className="portfolio-lead">
                I am Song Zhicheng, an architecture-trained AI product designer
                working across generative systems, Rhino automation and AIGC
                visualization.
              </p>
              <dl className="profile-facts">
                <div>
                  <dt>Based in</dt>
                  <dd>Beijing, China</dd>
                </div>
                <div>
                  <dt>Education</dt>
                  <dd>Beijing University of Technology, M.Arch</dd>
                </div>
                <div>
                  <dt>Focus</dt>
                  <dd>AI products and spatial computing</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="selected-work" id="selected-work">
            <h2>Selected work</h2>
            <div className="project-list">
              {projects.map((project) => (
                <article className="project-entry" key={project.title}>
                  <div className="project-heading">
                    <h3>{project.title}</h3>
                    <p>{project.subtitle}</p>
                  </div>
                  <figure className="project-media">
                    <Image
                      src={project.image}
                      alt={project.imageAlt}
                      fill
                      unoptimized
                      sizes="(max-width: 767px) 100vw, 86vw"
                    />
                  </figure>
                  <div className="project-notes">
                    <p>{project.description}</p>
                    <ul aria-label={`${project.title} disciplines`}>
                      {project.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <footer className="portfolio-footer">
            <p>Designing systems where language becomes space.</p>
            <button type="button" onClick={returnToOpening}>
              Return to opening
            </button>
          </footer>
        </section>

          <button
            className="assistant-orb"
            type="button"
            aria-label="Open project assistant"
            title="Project assistant"
          >
            <span className="assistant-orb-animation" aria-hidden="true">
              <Strands
                colors={["#F8FBFF", "#82A7CF", "#C1A4CF"]}
                count={4}
                speed={0.32}
                amplitude={1.15}
                waviness={1.2}
                thickness={0.62}
                glow={2.8}
                taper={2.7}
                spread={1.15}
                intensity={0.68}
                saturation={1.12}
                opacity={0.95}
                scale={1.65}
                glass
                refraction={0.72}
                dispersion={0.58}
                glassSize={1.04}
              />
            </span>
            <MessageCircle className="assistant-orb-icon" aria-hidden="true" />
          </button>
        </>
      )}

      {isJourneying && (
        <div className="journey-transition" aria-hidden="true">
          <div className="journey-velocity" />
          <div className="journey-aperture" />
        </div>
      )}
    </main>
  );
}
