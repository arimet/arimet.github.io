const articles = [
    {
        title: "Building AI-Powered Browser Extensions With WXT",
        excerpt: "FormAIdable is a browser extension for Chrome and Firefox that extracts information from one tab and automatically populates form fields in another. It makes a great tutorial for building extensions.",
        date: "April 15, 2025",
        category: "AI",
        image: "https://marmelab.com/_astro/cover.CT7y40yV_Z1M7m2T.webp",
        link: "https://marmelab.com/blog/2025/04/15/browser-extension-form-ai-wxt.html"
    },
    {
        title: "get-current-day: The Ultimate NPM Package For Today's Date",
        excerpt: "Leveraging cutting-edge JavaScript techniques, Marmelab proudly introduces a revolutionary library to get the current date. Say goodbye to timezone issues and date struggles with this innovative approach.",
        date: "April 1, 2025",
        category: "JS",
        image: "https://marmelab.com/_astro/banner.BtAjjQM7_ZrzjQF.webp",
        link: "https://marmelab.com/blog/2025/04/01/get-current-day.html"
    },
    {
        title: "Tech, Maroille, et Bière. Marmelab était à la DevFest Lille !",
        excerpt: "Marmelab était à la conférence lilloise et vous raconte les conférences qui ont marqué leur esprit.",
        date: "November 26, 2024",
        category: "Conf",
        image: "https://marmelab.com/_astro/devfest-lille.DYwAk9qK_Z1eeDR8.webp",
        link: "https://marmelab.com/blog/2024/11/26/devfest-lille.html"
    },
    {
        title: "Adding Voice Recognition To A Web App",
        excerpt: "Speech-to-Text is becoming a common feature, and modern tooling makes it easier to implement. Read how we built an Aqua clone using Cloudflare Workers AI, OpenAI Whisper, and Vue3.",
        date: "August 29, 2024",
        category: "AI",
        image: "https://marmelab.com/_astro/small.DvaAxAFK_ZbsDPS.webp",
        link: "https://marmelab.com/blog/2024/08/29/speech-to-text.html"
    },
    {
        title: "DotJs 2025: Rediscovering JavaScript's Future",
        excerpt: "From the stunning venue to the captivating talks and valuable networking opportunities, the conference exceeded our expectations.",
        date: "August 22, 2024",
        category: "Conf",
        image: "https://marmelab.com/_astro/large.OmsT38j9_Z15Fu6v.webp",
        link: "https://marmelab.com/blog/2024/08/22/dotjs-2024.html"
    },
    {
        title: "Building An AI Assistant at the Edge",
        excerpt: "Cloudflare recently launched Workers AI that provides machine learning model inference at the edge. This article explains how we built a simple AI Assistant using Nuxt and Llama 3 8B on Workers AI.",
        date: "July 5, 2024",
        category: "AI",
        image: "https://marmelab.com/_astro/small.DvaAxAFK_ZbsDPS.webp",
        link: "https://marmelab.com/blog/2024/07/05/ai-assistant-edge-cloudflare-workers-ai.html"
    },
    {
        title: "LIT: A Lightweight Library For Building Web Components",
        excerpt: "To explore the LIT framework, I built a framework-agnostic accordion component that I managed to reuse in React and Vue.",
        date: "April 18, 2024",
        category: "JS",
        image: "https://marmelab.com/_astro/small.BxrBgxsQ_Z2pLK5b.webp",
        link: "https://marmelab.com/blog/2024/04/18/web-component-with-lit.html"
    },
    {
        title: "Automate Your Workflow With Git Hooks",
        excerpt: "Git hooks are powerful automation tools that can improve your development workflow. Learn how to set up and use them effectively in your projects.",
        date: "February 27, 2024",
        category: "Devops",
        image: "https://marmelab.com/_astro/small.C6td90re_Z2r7ysj.webp",
        link: "https://marmelab.com/blog/2024/02/27/git-hooks.html"
    },
    {
        title: "Write JavaScript Shell Scripts With Bun",
        excerpt: "Bun is a modern JavaScript runtime that makes it easy to write shell scripts. Discover how to leverage its features for better automation.",
        date: "February 5, 2024",
        category: "JS",
        image: "https://marmelab.com/_astro/small.DArSPmOh_Z1DKIXL.webp",
        link: "https://marmelab.com/blog/2024/02/05/bun-shell.html"
    },
    {
        title: "Displaying Test Screenshots in GitHub Actions",
        excerpt: "Learn how to capture and display test screenshots in your GitHub Actions CI pipeline for better debugging and visibility.",
        date: "November 20, 2023",
        category: "Devops",
        image: "https://marmelab.com/_astro/small.CYKKx3uv_xjMFl.webp",
        link: "https://marmelab.com/blog/2023/11/20/screenshot-ci.html"
    },
    {
        title: "Tech, Crêpes, et Éthique. Marmelab était à MiXiT !",
        excerpt: "A recap of our experience at MiXiT conference, discussing technology, ethics, and the future of sustainable development.",
        date: "June 12, 2023",
        category: "Conf",
        image: "https://marmelab.com/_astro/large.DvfKLBI8_O9zCx.webp",
        link: "https://marmelab.com/blog/2023/06/12/mixit-2023.html"
    },
    {
        title: "Rive: Animate Web UIs with State Machines",
        excerpt: "Rive offers a powerful way to create complex animations using state machines. Learn how to integrate them into your web applications.",
        date: "January 30, 2023",
        category: "JS",
        image: "https://marmelab.com/_astro/generic-blog-thumbnail.Ba7f8ZxH_Z1pFPMP.webp",
        link: "https://marmelab.com/blog/2023/01/30/rive-animation-state-machine.html"
    },
    {
        title: "Building a B2B app with Strapi and React-Admin",
        excerpt: "A comprehensive guide to building B2B applications using Strapi as a headless CMS and React-Admin for the frontend.",
        date: "November 28, 2022",
        category: "JS",
        image: "https://marmelab.com/_astro/building.BA_rDYQg_1VQIXF.webp",
        link: "https://marmelab.com/blog/2022/11/28/building-a-crud-app-with-strapi-and-react-admin.html"
    },
    {
        title: "Writing A React-Admin Data Provider For Offline-First Applications",
        excerpt: "Create offline-first applications with React-Admin by building a custom data provider that works with local storage.",
        date: "October 26, 2022",
        category: "JS",
        image: "https://marmelab.com/_astro/storage.DgmaDGPp_vsB6B.webp",
        link: "https://marmelab.com/blog/2022/10/26/create-an-localforage-dataprovider-in-react-admin.html"
    },
    {
        title: "Create a CRUD API In Minutes With PostgREST",
        excerpt: "PostgREST automatically generates a RESTful API from your PostgreSQL database. Learn how to set it up in minutes.",
        date: "October 5, 2022",
        category: "Architecture",
        image: "https://marmelab.com/_astro/flash.CIyXt4hY_Z1QGwJz.webp",
        link: "https://marmelab.com/blog/2022/10/05/postgrest-api.html"
    },
    {
        title: "Bull: Traitements asynchrones en Node.js",
        excerpt: "Bull is a powerful Node.js library for handling asynchronous jobs and message queues with Redis.",
        date: "March 9, 2022",
        category: "Architecture",
        image: "https://marmelab.com/_astro/queue.Bi9eveh__Z1zYIFt.webp",
        link: "https://marmelab.com/blog/2022/03/09/inist-bulljs.html"
    },
    {
        title: "Intégration: dépasser la peur de l'échec",
        excerpt: "Overcoming the fear of failure during the integration process in software development teams.",
        date: "January 20, 2022",
        category: "Integration",
        image: "https://marmelab.com/_astro/cover.D9ImA6f9_fLOCh.webp",
        link: "https://marmelab.com/blog/2022/01/20/la-peur-de-lechec.html"
    },
    {
        title: "Improving User Experience With A Mouse In A CLI Application",
        excerpt: "Enhance command-line applications by adding mouse support using Node.js and the Blessed library.",
        date: "November 17, 2021",
        category: "Integration",
        image: "https://marmelab.com/_astro/hoverMarble.DLERQO5K_1b8Kja.webp",
        link: "https://marmelab.com/blog/2021/11/17/user-mouse-cli-blessed.html"
    }
];

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = articles;
}
