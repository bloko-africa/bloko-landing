"use client";

import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";
import { useState } from "react";

type RichTextEditorProps = {
  name: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
};

export function RichTextEditor({
  name,
  label,
  defaultValue,
  placeholder,
}: RichTextEditorProps) {
  const [html, setHtml] = useState(defaultValue || "");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Highlight,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: defaultValue || "",
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "rich-text min-h-32 rounded-b-lg px-4 py-3 outline-none dark:text-white",
      },
    },
  });

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-body-sm font-medium text-dark dark:text-white">
          {label}
        </label>
      )}
      <div className="rounded-lg border border-stroke dark:border-dark-3">
        <Toolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const buttons: { label: string; title: string; onClick: () => void; active: boolean }[] = [
    {
      label: "G",
      title: "Gras",
      onClick: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      label: "I",
      title: "Italique",
      onClick: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      label: "S",
      title: "Souligné",
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive("underline"),
    },
    {
      label: "H",
      title: "Surligner",
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      active: editor.isActive("highlight"),
    },
    {
      label: "H2",
      title: "Titre",
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "•",
      title: "Liste à puces",
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      label: "1.",
      title: "Liste numérotée",
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      label: "🔗",
      title: "Lien",
      onClick: () => {
        const url = window.prompt("URL du lien");
        if (url) editor.chain().focus().setLink({ href: url }).run();
        else editor.chain().focus().unsetLink().run();
      },
      active: editor.isActive("link"),
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 rounded-t-lg border-b border-stroke bg-gray-1 p-1.5 dark:border-dark-3 dark:bg-dark-2">
      {buttons.map((btn) => (
        <button
          key={btn.title}
          type="button"
          title={btn.title}
          onClick={btn.onClick}
          className={cn(
            "flex size-8 items-center justify-center rounded text-body-sm font-medium text-dark-5 hover:bg-white dark:text-dark-6 dark:hover:bg-dark-3",
            btn.active && "bg-white text-primary dark:bg-dark-3",
          )}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
