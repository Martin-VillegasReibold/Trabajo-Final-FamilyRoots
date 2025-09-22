import { login, register } from '@/routes';
import { Link, Head } from '@inertiajs/react';
import { home } from '@/routes';

export default function About() {

    return (
        <div className="p-6">
            <Head title="Sobre nosotros" />
            <header className="w-full bg-white dark:bg-[#aae4b3fe] fixed top-0 left-0 z-50 shadow-sm">
                <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                    <Link
                        href={home()}
                        className="flex flex-col items-center gap-2 font-medium">
                        <img src="../../../../imagenes/logo Arbol.png" alt="Mi Logo" className='h-20 w-auto hover:opacity-50 transition-opacity duration-200' />
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href={login()} className="inline-block rounded-sm bg-[#53a460fe] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:bg-[#229a36fe] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#ffffff] dark:hover:border-[#248233fe]">
                            Iniciar sesión
                        </Link>
                        <Link href={register()} className="inline-block rounded-sm bg-[#53a460fe] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:bg-[#229a36fe] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#ffffff] dark:hover:border-[#248233fe]">
                            Registrarse
                        </Link>
                        <Link href="/about" className="inline-block rounded-sm bg-[#53a460fe] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:bg-[#229a36fe] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#ffffff] dark:hover:border-[#248233fe]">
                            Sobre nosotros
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="pt-24"> 
                <div>
                    <h1 className="text-2xl font-bold">Sobre nosotros</h1>
                    <p className="mt-4">
                        Somos FamilyRoots, una plataforma para construir árboles genealógicos.
                    </p>
                </div>
            </main>
        </div>
    );
}
