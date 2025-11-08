<?php

namespace App\Mail;

use App\Models\Arbol;
use App\Models\ArbolInvitacion;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InvitacionArbolMail extends Mailable
{
    use Queueable, SerializesModels;

    public $invitacion;
    public $arbol;

    /**
     * Create a new message instance.
     */
    public function __construct(ArbolInvitacion $invitacion, Arbol $arbol)
    {
        $this->invitacion = $invitacion;
        $this->arbol = $arbol;
    }

    /**
     * Build the message.
     */
    public function build()
{
    $url = route('invitaciones.aceptar', $this->invitacion->token);

    return $this->subject('Invitación para colaborar en un árbol familiar en Family Roots')
                ->view('emails.invitacion_arbol')
                ->with([
                    'url' => $url,
                ]);
}

}
