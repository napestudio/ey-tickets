"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[120px] px-3 py-2 text-sm",
      },
    },
  });

  if (!editor) return null;

  const toolbarItems = [
    {
      icon: Bold,
      label: "Negrita",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      icon: Italic,
      label: "Cursiva",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      icon: List,
      label: "Lista",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Lista numerada",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
  ];

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className
      )}
    >
      <div className="flex gap-1 border-b border-input px-2 py-1">
        {toolbarItems.map(({ icon: Icon, label, action, isActive }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="sm"
            onClick={action}
            className={cn("h-7 w-7 p-0", isActive && "bg-muted")}
            title={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
