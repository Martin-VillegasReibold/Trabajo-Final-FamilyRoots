<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Calendar;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $query = Calendar::where('user_id', $request->user()->id)
            ->select('id', 'title', 'start', 'end', 'color', 'created_at')
            ->get();

        return Inertia::render('calendar', [
            'calendars' => $query,
            'flash' => [
                'success' => session('success'),
                'error' => session('error')
            ]
        ]);
    }
 
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'startdate' => 'required|date',
            'enddate' => 'required|date|after_or_equal:startdate',
            'color' => 'required|string|max:7',
        ]);

        Calendar::create([
            'title' => $request->title,
            'start' => $request->startdate,
            'end' => $request->enddate,
            'color' => $request->color,
            'user_id' => $request->user()->id,
        ]);

        return redirect()->route('calendar.index')->with('success', 'Evento creado exitosamente!');
    }
 
    public function destroy(Request $request, $id)
    {
        $calendar = Calendar::where('user_id', $request->user()->id)->findOrFail($id);
        $calendar->delete();
        return redirect()->route('calendar.index')->with('success', 'Evento eliminado exitosamente!');
    }
 
    public function update(Request $request, $id)
    {
        $request->validate([
            'start' => 'required|date',
            'end' => 'required|date|after_or_equal:start',
        ]);

        $calendar = Calendar::where('user_id', $request->user()->id)->findOrFail($id);
        $calendar->update($request->only('start', 'end'));

        return redirect()->route('calendar.index')->with('success', 'Evento actualizado exitosamente!');
    }
}
