import { useEffect, useState } from 'react';

/**
 * A component that attempts to detect Developer Tools and blocks access to the site content.
 * Note: Client-side detection is never 100% secure, but this provides a strong deterrent.
 */
export default function DevToolsBlocker() {
    const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

    useEffect(() => {
        // Disable right-click context menu
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        // Disable keyboard shortcuts (F12, Ctrl+Shift+I, etc.)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                (e.ctrlKey && e.key === 'U') // View Source
            ) {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        // --- Detection Strategies ---

        const threshold = 160;

        const detectDevTools = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            // If window is properly docked, detected via dimension difference
            if (widthThreshold || heightThreshold) {
                setIsDevToolsOpen(true);
            } else {
                setIsDevToolsOpen(false);
            }
        };

        // Check on resize
        window.addEventListener('resize', detectDevTools);

        // Interval check for dimension based detection (covers independent window)
        // Note: detached devtools are harder to detect purely by dimension.
        const intervalId = setInterval(() => {
            detectDevTools();

            // Debugger trap: execution pauses here if devtools is open
            const start = performance.now();
            // eslint-disable-next-line no-debugger
            debugger;
            const end = performance.now();

            // If debugger paused execution significantly, devtools likely open
            if (end - start > 100) {
                setIsDevToolsOpen(true);
            }

        }, 1000);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', detectDevTools);
            clearInterval(intervalId);
        };
    }, []);

    if (!isDevToolsOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#000',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexDirection: 'column',
                gap: '20px'
            }}
        >
            <h1 style={{ fontSize: '2rem', color: 'red' }}>Access Denied</h1>
            <p>Developer Tools are not permitted on this site.</p>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>Please close the inspector to return.</p>
        </div>
    );
}
