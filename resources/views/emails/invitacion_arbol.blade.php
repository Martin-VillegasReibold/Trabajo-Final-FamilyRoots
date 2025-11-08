<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invitación para colaborar</title>
</head>
<body style="font-family: Arial, sans-serif; background: #00E880; background: radial-gradient(circle, rgba(0, 232, 128, 1) 0%, rgba(6, 150, 85, 1) 100%); padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 20px;">
        <div style="text-align: center;">
            <img src="{{ url('/imagenes/logo Arbol.png') }}" style="max-width: 200px; height: auto;"/>
        </div>
        <hr style="border: none; height: 3px; background: linear-gradient(90deg, rgba(0, 232, 128, 1) 0%, rgba(6, 150, 85, 1) 100%); margin: 20px 0;"/>
        <h2>¡Te invitaron a colaborar en un árbol familiar! <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#009903" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tree-pine-icon lucide-tree-pine"><path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"/><path d="M12 22v-3"/></svg></h2>
        <p>Has sido invitado a colaborar en el árbol <strong>{{ $arbol->name }}</strong>.</p>

        <p>Para unirte y empezar a editarlo, haz clic en el siguiente botón:</p>

        <a href="{{ $url }}">Aceptar invitación</a>

        <p style="margin-top:20px; font-size:14px; color:#555;">
            Si no esperabas esta invitación, puedes ignorar este correo.
        </p>
    </div>
</body>
</html>
