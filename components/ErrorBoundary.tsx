import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleClearData = () => {
        localStorage.clear();
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 font-display">
                    <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-red-100 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Đã xảy ra lỗi hệ thống</h1>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-60 mb-6 font-mono text-sm border border-gray-200">
                            <p className="text-red-600 font-bold mb-2">{this.state.error?.toString()}</p>
                            <pre className="text-gray-600 whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
                        </div>

                        <div className="text-gray-600 mb-6 text-sm">
                            <p className="mb-2">Nếu lỗi này liên tục xảy ra, có thể dữ liệu lưu trong máy đang bị lỗi.</p>
                            <p>Hãy thử nhấn nút "Xóa dữ liệu & Tải lại" bên dưới.</p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-all"
                            >
                                Tải lại trang
                            </button>

                            <button
                                onClick={this.handleClearData}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/20"
                            >
                                Xóa dữ liệu & Tải lại
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
