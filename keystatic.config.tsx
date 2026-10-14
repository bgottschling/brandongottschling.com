import { collection, config, fields, singleton } from "@keystatic/core";
import { block, wrapper } from "@keystatic/core/content-components";
import { BUCKET_LABEL, PRIMARY_CATEGORIES, type PrimaryCategory } from "@/lib/buckets";

const categoryOptions = PRIMARY_CATEGORIES.map((value) => ({
  label: BUCKET_LABEL[value],
  value,
}));

// Components available inside the MDX editor — mirrors src/components/mdx-components.tsx
const contentComponents = {
  ProjectHeader: block({
    label: "Project Header",
    schema: {
      status: fields.text({ label: "Status" }),
      live: fields.url({ label: "Live URL" }),
      repo: fields.url({ label: "Repo URL" }),
    },
  }),
  CTA: wrapper({
    label: "CTA",
    schema: {
      title: fields.text({ label: "Title" }),
      href: fields.url({ label: "Link" }),
    },
  }),
};

const body = () =>
  fields.mdx({
    label: "Content",
    components: contentComponents,
    options: { image: false },
  });

const titleWithSlug = () =>
  fields.slug({
    name: { label: "Title", validation: { isRequired: true } },
    slug: { label: "Filename slug", description: "Becomes the URL path segment." },
  });

const tags = () =>
  fields.array(fields.text({ label: "Tag" }), {
    label: "Tags",
    itemLabel: (props) => props.value,
  });

const dateField = (label = "Date") => fields.date({ label, validation: { isRequired: true } });

const summary = () =>
  fields.text({ label: "Summary", multiline: true, validation: { isRequired: true } });

const cover = () =>
  fields.text({
    label: "Cover image path",
    description: "Public path, e.g. /images/blog/my-post/cover.png",
  });

const primaryCategory = (defaultValue: PrimaryCategory) =>
  fields.select({ label: "Primary category", options: categoryOptions, defaultValue });

// Legacy frontmatter keys the site derives elsewhere; preserved verbatim, hidden from the UI.
const legacy = () => ({
  type: fields.ignored(),
  slug: fields.ignored(),
});

export default config({
  storage: { kind: "local" },
  ui: {
    brand: { name: "brandongottschling.com" },
  },
  collections: {
    blog: collection({
      label: "Blog",
      path: "content/blog/*",
      slugField: "title",
      format: { contentField: "content" },
      entryLayout: "content",
      columns: ["date"],
      schema: {
        ...legacy(),
        title: titleWithSlug(),
        date: dateField(),
        summary: summary(),
        primaryCategory: primaryCategory("other"),
        tags: tags(),
        cover: cover(),
        draft: fields.checkbox({ label: "Draft", defaultValue: false }),
        published: fields.checkbox({ label: "Published", defaultValue: true }),
        featured: fields.checkbox({ label: "Featured", defaultValue: false }),
        content: body(),
      },
    }),
    research: collection({
      label: "Research",
      path: "content/research/*",
      slugField: "title",
      format: { contentField: "content" },
      entryLayout: "content",
      columns: ["date"],
      schema: {
        ...legacy(),
        title: titleWithSlug(),
        date: dateField(),
        summary: summary(),
        primaryCategory: primaryCategory("research"),
        tags: tags(),
        cover: cover(),
        content: body(),
      },
    }),
    projects: collection({
      label: "Projects",
      path: "content/projects/*",
      slugField: "title",
      format: { contentField: "content" },
      entryLayout: "content",
      columns: ["date"],
      schema: {
        ...legacy(),
        title: titleWithSlug(),
        date: dateField(),
        summary: summary(),
        status: fields.text({ label: "Status", description: 'e.g. "Active v0.5"' }),
        stage: fields.select({
          label: "Stage",
          options: [
            { label: "Idea", value: "idea" },
            { label: "Prototype", value: "prototype" },
            { label: "Beta", value: "beta" },
            { label: "Live", value: "live" },
            { label: "Archived", value: "archived" },
          ],
          defaultValue: "idea",
        }),
        primaryCategory: primaryCategory("projects"),
        tags: tags(),
        cover: cover(),
        links: fields.object(
          {
            live: fields.url({ label: "Live URL" }),
            repo: fields.url({ label: "Repo URL" }),
          },
          { label: "Links" }
        ),
        content: body(),
      },
    }),
    pages: collection({
      label: "Pages",
      path: "content/pages/*",
      slugField: "title",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        ...legacy(),
        title: titleWithSlug(),
        content: body(),
      },
    }),
    nowArchive: collection({
      label: "Now (archive)",
      path: "content/now/*",
      slugField: "title",
      format: { contentField: "content" },
      entryLayout: "content",
      columns: ["date"],
      schema: {
        ...legacy(),
        title: titleWithSlug(),
        date: dateField(),
        updated: fields.date({ label: "Updated" }),
        summary: summary(),
        tags: tags(),
        content: body(),
      },
    }),
  },
  singletons: {
    now: singleton({
      label: "Now",
      path: "content/now",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        ...legacy(),
        title: fields.text({ label: "Title", defaultValue: "Now" }),
        date: fields.date({ label: "Date" }),
        updated: fields.date({ label: "Updated" }),
        summary: summary(),
        tags: tags(),
        content: body(),
      },
    }),
  },
});
