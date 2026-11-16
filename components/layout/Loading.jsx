// components/layout/Loading.jsx

'use client';

const Loading = () => {
    return (
        <div className="flex h-64 items-center justify-center">
            <div className="flex h-12 w-12 animate-spin items-center justify-center rounded-full border-t-2 border-b-2 border-black">
                <div className="flex h-10 w-10 animate-spin items-center justify-center rounded-full border-t-2 border-b-2 border-black">
                    <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-black" />
                </div>
            </div>
        </div>
    );
};

export default Loading;
