import * as React from 'react'

const NotFound = (): React.ReactNode => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 w-100" style={{width: "100%"}}>
            <h1 className="text-6xl font-bold text-gray-800" style={{textAlign: 'center'}}>404</h1>
            <p className="mt-4 text-lg text-gray-600" style={{textAlign: 'center'}}>
                Page Not Found<br/>
                <br/>
                <a href="/dashboard" className="mt-6 text-blue-500 hover:underline">
                    Go back to Home
                </a>
            </p>
        </div>
    );
}
export default NotFound;
