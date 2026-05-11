import React, { useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import {
    LuBold,
    LuItalic,
    LuUnderline,
    LuList,
    LuListOrdered,
    LuQuote,
    LuHighlighter,
    LuPalette,
    LuX,
} from 'react-icons/lu';

const ToolbarButton = ({ onClick, active, children, title, disabled }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={`h-7 w-7 inline-flex items-center justify-center rounded-md transition-colors ${
            active
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
        {children}
    </button>
);

const ToolbarDivider = () => <span className="h-4 w-px bg-gray-300 mx-1" />;

const RichTextEditor = ({
    value,
    onChange,
    minHeight = '160px',
    maxHeight = '320px',
}) => {
    const colorInputRef = useRef();

    const editor = useEditor({
        extensions: [StarterKit, Underline, TextStyle, Color, Highlight],
        content: value || '',
        onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
        editorProps: {
            attributes: {
                class: 'tiptap focus:outline-none text-sm text-gray-900 px-3 py-2.5',
            },
        },
    });

    // Sync external value updates (e.g. when an Update form fetches data
    // after the editor has mounted). `false` prevents re-emitting onUpdate.
    useEffect(() => {
        if (!editor) return;
        if (editor.isFocused) return;
        if ((value || '') !== editor.getHTML()) {
            editor.commands.setContent(value || '', false);
        }
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div className="rounded-md border border-gray-300 bg-white transition-colors focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-500">
            <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 rounded-t-md flex-wrap">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                    title="Bold"
                >
                    <LuBold size={14} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                    title="Italic"
                >
                    <LuItalic size={14} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive('underline')}
                    title="Underline"
                >
                    <LuUnderline size={14} />
                </ToolbarButton>
                <ToolbarDivider />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                    title="Bullet list"
                >
                    <LuList size={14} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                    title="Numbered list"
                >
                    <LuListOrdered size={14} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive('blockquote')}
                    title="Quote"
                >
                    <LuQuote size={14} />
                </ToolbarButton>
                <ToolbarDivider />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    active={editor.isActive('highlight')}
                    title="Highlight"
                >
                    <LuHighlighter size={14} />
                </ToolbarButton>
                <div className="relative inline-flex">
                    <ToolbarButton
                        onClick={() => colorInputRef.current?.click()}
                        title="Text color"
                    >
                        <LuPalette size={14} />
                    </ToolbarButton>
                    <input
                        ref={colorInputRef}
                        type="color"
                        onChange={(e) =>
                            editor.chain().focus().setColor(e.target.value).run()
                        }
                        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                        tabIndex={-1}
                    />
                </div>
                <ToolbarButton
                    onClick={() => editor.chain().focus().unsetColor().run()}
                    title="Clear color"
                >
                    <LuX size={14} />
                </ToolbarButton>
            </div>
            <div
                className="overflow-y-auto sidebar-scroll"
                style={{ minHeight, maxHeight }}
            >
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default RichTextEditor;
