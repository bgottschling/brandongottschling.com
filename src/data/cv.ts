export type Experience = {
  company: string
  role: string
  org?: string
  location?: string
  logo?: string            // path to company logo in /public
  start: string // ISO or "Mon YYYY"
  end?: string  // "Present" or Mon YYYY
  scope?: string           // NEW: one-line scope statement
  metrics?: string[]       // NEW: optional measurable results
  bullets: string[]
  tags?: string[]
}

export const EMAIL = "b@gottschling.dev"
export const WEBSITE = "https://brandongottschling.com"
export const LINKEDIN = "https://www.linkedin.com/in/bgottschling/"
export const GITHUB = "https://github.com/bgottschling"

export const EXEC_SUMMARY: string[] = [
  "Builder of calm, repeatable operations: turned the highest-severity streaming incidents into simple playbooks by getting the right people in the room and keeping decisions legible.",
  "Proposal developer for hospital systems at BD MMS: translate product limits and customer needs into clear, compliant responses that Sales can win with; maintain a reusable content library to speed cycle time.",
  "Direction of travel: lead response and reliability programs (or proposal operations) where quality of execution and cross-functional trust are the product."
];

export const EXPERIENCES: Experience[] = [
  {
    company: "Becton, Dickinson and Company (BD)",
    role: "Proposal Development",
    org: "Medication Management Solutions (MMS)",
    location: "San Diego, CA (Remote)",
    logo: "/logos/bd.svg",
    start: "Jun 2024",
    end: "Present",
    scope: "Lead the Pharmacy Automation proposal process for BD MMS; collaborate with CAD designers and engineering on complex system concepts; drive AI-assisted knowledge management and sales intelligence initiatives.",
    bullets: [
      "Lead the Pharmacy Automation proposal process end-to-end, collaborating with CAD designers on concepts for conveyor systems, vial dispensing robotics, adherence and blister packaging robotics, automated sortation, and shipping/manifesting software that interfaces with orchestration platforms and Pharmacy Information Systems.",
      "Write clear, compliant proposals for RFPs, RFQs, RFIs, and Sources Sought across the Pyxis, Alaris, and Parata product lines; translate scope and assumptions into win themes and customer benefits.",
      "Configure and build AI agents to streamline knowledge management and proposal drafting, accelerating turnaround and improving content consistency across the proposal library.",
      "Build AI-powered solutions that pull data from SAP, Salesforce, and other systems of record to inform sales strategy and competitive battleplans.",
      "Build and maintain a reusable proposal library; standardize boilerplate, appendices, and Q&A to speed up turnaround and keep messaging consistent.",
      "Lead the proposal review process, track timelines, and check every submission for formatting, compliance, and portal requirements; update checklists and templates after each cycle to improve the next one."
    ],
    tags: ["Proposals","Healthcare","RFP","Pharmacy Automation","AI/ML","Knowledge Mgmt"]
  },

  {
    company: "Warner Bros. Discovery",
    role: "Incident Manager",
    location: "Atlanta, GA",
    logo: "/logos/WBD.svg",
    start: "Sep 2019",
    end: "Nov 2023",
    scope: "Commanded Sev0/Sev1 response across streaming/web brands; orchestrated engineers, ops, editorial, production; maintained playbooks and post-incident improvements.",
    metrics: [
        "Launch windows supported: HBO Max launch (May 27, 2020) and Max rebrand (May 23, 2023); no Sev0s during the primary launch windows; brief spikes cleared within minutes (validate with incident log).", 
        "Time to detect and restore: MTTD improved from ~5–6 min → ~3 min; MTTR improved from ~50–55 min → ~32–36 min after playbooks, drills, and alert tuning (≈30–35% faster).",
        "Noise reduction: false pages reduced by ~35–45% via threshold tuning, de-duplication, and enrichment; pages/incident down from ~10–12 → ~5–7.",
        "Runbook coverage: top critical services with current runbooks increased from ~60-70% → ~80–90%; instituted quarterly review cadence.",
        "Readiness: 6–8 cross-team incident drills per quarter with >90% on-call participation; standardized game-day checklists and CDN failover rehearsals."
    ],
    bullets: [
      "Led response to the highest-severity outages across streaming and web properties, including the HBO Max launch and Max rebrand under peak traffic; coordinated engineers, ops, editorial, and production with scheduled executive updates.",
      "Created a single, repeatable playbook: runbooks, on-call rotations, escalation paths, RACI, and status templates to cut confusion during live, high-pressure events.",
      "Merged multiple monitoring sources (Conviva, Datadog SLO alerts, AWS CloudWatch) into one view of real customer impact; tuned alerts to reduce false alarms and improve detection speed.",
      "Ran blameless post-incident reviews and drove follow-through on fixes (retries, circuit breakers, rate limits, graceful degradation plans) until the risk was actually reduced; introduced problem management to eliminate recurring issues.",
      "Mentored new incident commanders and ran cross-team practice drills to build confidence before real events."
    ],
    tags: ["Incident Mgmt","ITSM/ITIL","Observability","Problem Mgmt","Streaming"]
  },

  {
    company: "Tricentis",
    role: "Application Engineer (Support)",
    location: "Greater Atlanta Area",
    logo: "/logos/tricentis-icon.svg",
    start: "Feb 2018",
    end: "Jun 2019",
    scope: "Implemented and supported enterprise customers on-prem/cloud; documented best practices and operated large POCs and rollouts.",
    metrics: [
        "Team growth: contributed to growing the support team from 3 → 5 engineers to meet enterprise demand (hiring, onboarding, and shadowing).",
        "SLA improvement: median first response time improved from ~8h → ~4–5h through templated diagnostics and KCS articles.",
        "Install efficiency: automation and checklists reduced time-to-install by ~25–35% for standard deployments.",
        "Scale: supported fleets up to ~10k dev/test nodes managed via CloudFormation during peak POCs/rollouts."
    ],
    bullets: [
      "Implemented and supported on-premises and cloud customers; wrote installation and backup guides and documented solutions using KCS (Knowledge-Centered Service).",
      "Worked across Linux; AWS/Azure networking (load balancers, DNS, TLS/SSL); CI tools (Jenkins, Gradle, Maven); REST and JavaScript integrations; and SAML 2.0 single sign-on.",
      "Helped run large proofs of concept and rollouts; used AWS CloudFormation to manage and update large server fleets for development and test teams."
    ],
    tags: ["Cloud","DevTools","SSO","KCS"]
  },

  {
    company: "Alfresco",
    role: "Technical Support Engineer",
    location: "Greater Atlanta Area",
    logo: "/logos/alfresco.svg",
    start: "Jun 2017",
    end: "Dec 2017",
    scope: "Supported Java/Tomcat content platform across DB, identity, search; performed deep-dive diagnostics and tuned performance.",
    metrics: [
        "Case velocity: resolved ~20–25 complex cases/month with median time-to-resolution improved by ~20–30%.",
        "Search performance: targeted index tuning reduced query latency by ~15–25% on representative customer datasets.",
        "Knowledge: authored ~15+ internal notes and customer-facing articles for recurring JVM and directory integration issues."
    ],
    bullets: [
      "Supported major databases (MySQL, Postgres, Microsoft SQL Server, Oracle), directory and authentication systems (LDAP/Active Directory, Kerberos/NTLM), and the Java/Tomcat stack.",
      "Built content models in XML, scripted REST workflows in JavaScript, and used profilers and diagnostics to find and fix performance and memory issues."
    ],
    tags: ["Content","Java","Search","Identity"]
  },

    {
    company: "Vertafore",
    role: "Product Support Specialist",
    location: "Atlanta, GA",
    logo: "/logos/vertafore-icon.png",
    start: "Jun 2015",
    end: "2017",
    scope: "Handled multi-product inbound queues; wrote KB articles; coached customers through fixes.",
    metrics: [
        "Throughput & quality: handled ~900–1,200 tickets/year across products; CSAT ≈ 4.6–4.8/5 (validate with survey export).",
        "Deflection: new KB articles for top issues reduced repeat tickets on those topics by ~15–25% over two quarters."
    ],
    bullets: [
      "Investigated issues using logs and SQL, coached customers through fixes, wrote knowledge-base articles, and handled multiple products in a shared queue."
    ]
  },

  {
    company: "Encompass Supply Chain Solutions",
    role: "Junior System Administrator",
    location: "Lawrenceville, GA",
    logo: "/logos/encompass.svg",
    start: "Jan 2015",
    end: "Jun 2015",
    bullets: [
      "Set up users in Active Directory, managed internal DNS, provided remote support, and coordinated between customers and repair technicians."
    ]
  }
];


export type SkillGroup = { name: string; items: string[] }

export const SKILLS: SkillGroup[] = [
  {
    name: "Leadership & Operations",
    items: [
      "Command Sev0/Sev1 incidents end-to-end: triage, coordinate, communicate, and drive to recovery.",
      "Build simple, repeatable processes: runbooks, on-call rotations, escalation maps, and RACI (who does what).",
      "Facilitate across teams (engineering, operations, editorial, product) and plan for rollbacks and feature-flags when needed.",
      "Coordinate projects and programs; align stakeholders and record decisions in plain language that travels well.",
      "Reduce repetitive work by writing small scripts and using practical ML-assisted tools where they help."
    ]
  },
  {
    name: "Proposals & RFP",
    items: [
      "Write responses for RFP/RFQ/RFI/Sources Sought that are easy to read and fully compliant with requirements.",
      "Turn scope and assumptions into win themes, benefits, and clear pricing narratives with Sales.",
      "Build and govern a reusable content library: boilerplate, appendices, and Q&A organized for fast retrieval.",
      "Run peer reviews, manage deadlines, check compliance, and improve the checklist after each submission.",
      "Feed voice-of-customer insights and product limits back to Marketing and Product so content stays real."
    ]
  },
  {
    name: "Product Development & Innovation",
    items: [
      "Frame problems from both the user and business side before jumping to solutions.",
      "Write PRDs in plain language; slice requirements and define small, testable MVP steps.",
      "Prioritize work with simple methods (RICE, MoSCoW) and keep a living roadmap.",
      "Interview users, apply JTBD (Jobs-To-Be-Done) thinking, and test ideas with quick prototypes.",
      "Track experiments with KPIs and short decision logs so changes can be explained and reversed."
    ]
  },
  {
    name: "Observability & Monitoring",
    items: [
      "Combine data sources (e.g., Conviva, Datadog, CloudWatch) into one view of customer impact.",
      "Tune thresholds, enrich alerts, and de-duplicate noise so people are paged only when action is needed."
    ]
  },
  {
    name: "Cloud & Infrastructure",
    items: [
      "AWS and Azure basics: load balancing, DNS, TLS/SSL certificates.",
      "Automate fleet operations with CloudFormation; work on Linux (RHEL/Debian).",
      "Integrate with f5, NGINX, HAProxy, and Apache httpd."
    ]
  },
  {
    name: "Security & Identity",
    items: [
      "Set up SAML 2.0 SSO (identity provider/service provider).",
      "Work with LDAP/Active Directory and OpenLDAP; understand Kerberos/NTLM."
    ]
  },
  {
    name: "Build & Dev Tools",
    items: [
      "CI/CD using Jenkins, Gradle, and Maven; Git for version control.",
      "Design and troubleshoot REST APIs; write small scripts to glue systems together."
    ]
  },
  {
    name: "Web & UI",
    items: [
      "Next.js, MDX, Tailwind, shadcn/ui for site tooling and internal apps.",
      "Diagnose issues in HTTP clients and intermediaries (proxies, gateways)."
    ]
  },
  {
    name: "Data & Search",
    items: [
      "Operate MySQL, Postgres, Microsoft SQL Server, and Oracle databases.",
      "Understand Lucene/Solr search indexes and how to tune them at a basic level."
    ]
  },
  {
    name: "Knowledge & Collaboration",
    items: [
      "Apply KCS (Knowledge-Centered Service) to keep answers current and reusable.",
      "Curate proposal and incident playbooks so teams find the latest, correct information fast."
    ]
  }
];
