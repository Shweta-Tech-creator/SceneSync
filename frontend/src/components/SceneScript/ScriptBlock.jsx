import React, { useRef, useEffect } from 'react';
import './ScriptEditor.css';

const ScriptBlock = ({ block, onUpdate, onKeyDown, onFocus, isFocused }) => {
    const textareaRef = useRef(null);

    // Auto-resize textarea to fit content
    const autoResize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    // Resize on mount and when content changes
    useEffect(() => {
        autoResize();
    }, [block.content]);

    useEffect(() => {
        if (isFocused && textareaRef.current) {
            textareaRef.current.focus();
            // Move cursor to end
            textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
        }
    }, [isFocused]);

    const handleChange = (e) => {
        onUpdate(block.id, e.target.value);
        autoResize();
    };

    const handleKeyDown = (e) => {
        onKeyDown(e, block.id);
    };

    return (
        <div className={`script-block ${block.type}`}>
            <textarea
                ref={textareaRef}
                value={block.content}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => onFocus(block.id)}
                rows={1}
                placeholder={block.type === 'scene-heading' ? 'INT. SCENE - DAY' : ''}
                style={{ overflow: 'hidden', resize: 'none' }}
            />
        </div>
    );
};

export default ScriptBlock;
