import React from 'react';
import './PageManager.css';

const PageManager = ({ pages, currentPage, onPageSwitch, onAddPage, onDeletePage, onMovePageUp, onMovePageDown }) => {
    const handleDeletePage = (pageNumber, e) => {
        e.stopPropagation(); // Prevent page switch when clicking delete
        if (pages.length > 1) { // Don't allow deleting the last page
            onDeletePage(pageNumber);
        } else {
            alert('Cannot delete the last page!');
        }
    };

    const handleMoveUp = (pageNumber, e) => {
        e.stopPropagation();
        onMovePageUp(pageNumber);
    };

    const handleMoveDown = (pageNumber, e) => {
        e.stopPropagation();
        onMovePageDown(pageNumber);
    };

    return (
        <div className="page-manager">
            <div className="page-manager-header">
                <h3>Pages</h3>
                <button className="add-page-btn" onClick={onAddPage}>
                    + Add Page
                </button>
            </div>

            <div className="pages-list">
                {pages.map((page, index) => (
                    <div
                        key={page.pageNumber}
                        className={`page-thumbnail ${currentPage === page.pageNumber ? 'active' : ''}`}
                        onClick={() => onPageSwitch(page.pageNumber)}
                    >
                        <div className="page-preview">
                            {page.thumbnail ? (
                                <img src={page.thumbnail} alt={`Page ${page.pageNumber}`} />
                            ) : (
                                <div className="page-placeholder">
                                    <span className="page-number">{page.pageNumber}</span>
                                </div>
                            )}
                        </div>
                        <div className="page-label">Page {page.pageNumber}</div>
                        <div className="page-actions-storyboard">
                            <button
                                className="page-action-btn-storyboard move-up"
                                onClick={(e) => handleMoveUp(page.pageNumber, e)}
                                disabled={index === 0}
                                title="Move page up"
                            >
                                ↑
                            </button>
                            <button
                                className="page-action-btn-storyboard move-down"
                                onClick={(e) => handleMoveDown(page.pageNumber, e)}
                                disabled={index === pages.length - 1}
                                title="Move page down"
                            >
                                ↓
                            </button>
                            {pages.length > 1 && (
                                <button
                                    className="page-action-btn-storyboard delete"
                                    onClick={(e) => handleDeletePage(page.pageNumber, e)}
                                    title="Delete Page"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PageManager;
