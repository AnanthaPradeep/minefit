export function SplashScreen() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="flex w-full max-w-sm flex-col items-center justify-center text-center">
                <img src="/assets/images/logo.png" alt="MineFit logo" className="block h-50 w-auto rounded-xl object-contain" />
                <img src="/assets/images/logo1.png" alt="MineFit wordmark" className="-mt-25 block h-60 w-auto object-contain" />
            </div>
        </div>
    );
}
