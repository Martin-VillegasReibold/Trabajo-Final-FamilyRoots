//import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-15 items-center justify-center rounded-md  text-sidebar-primary-foreground">
                <img 
                    src="/../../../../imagenes/logo Arbol.png" 
                    alt="Family Roots" 
                    className="size-15 object-contain" 
                />
            </div>
            <div className="ml-3 grid flex-1 text-left text-base">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Family Roots
                </span>
            </div>
        </>
    );
}
