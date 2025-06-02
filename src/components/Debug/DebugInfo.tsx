
export function DebugInfo() {
    return (
        <div className="bg-gray-100 p-4 rounded-lg text-xs space-y-2">
            <h3 className="font-bold">Debug Info</h3>
            <div><strong>Environment:</strong> {import.meta.env.VITE_APP_ENVIRONMENT || 'undefined'}</div>
            <div><strong>MCP Server URL:</strong> {import.meta.env.VITE_MCP_SERVER_URL || 'undefined'}</div>
            <div><strong>Current Origin:</strong> {window.location.origin}</div>
            <div><strong>Current URL:</strong> {window.location.href}</div>
            <div><strong>User Agent:</strong> {navigator.userAgent}</div>
        </div>
    );
} 