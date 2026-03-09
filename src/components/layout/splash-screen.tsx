export function SplashScreen() {
    const logo = `${import.meta.env.BASE_URL}assets/images/logo.png`;
    const logoWordmark = `${import.meta.env.BASE_URL}assets/images/logo1.png`;

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="flex w-full max-w-sm flex-col items-center justify-center text-center">
                <img src={logo} alt="MineFit logo" className="block h-50 w-auto rounded-xl object-contain" />
                <img src={logoWordmark} alt="MineFit wordmark" className="-mt-20 block h-60 w-auto object-contain" />
            </div>
        </div>
    );
}
