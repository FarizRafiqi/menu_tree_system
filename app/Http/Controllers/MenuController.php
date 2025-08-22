<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Services\MenuService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function __construct(private MenuService $menuService) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $menus = $this->menuService->list();
        return Inertia::render('Menu', [
            'menus' => $menus,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'depth' => 'required|integer|min:0',
            'parent_id' => 'nullable|string|exists:menus,id',
            'name' => 'required|string|max:255',
        ]);

        $this->menuService->create($data);

        return redirect()->route('menus.index')->with('success', 'Menu created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Menu $menu)
    {
        $data = $request->validate([
            'depth' => 'required|integer|min:0',
            'parent_id' => 'nullable|string|exists:menus,id',
            'name' => 'required|string|max:255',
        ]);

        $this->menuService->update($menu, $data);

        return redirect()->route('menus.index')->with('success', 'Menu updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Menu $menu)
    {
        $this->menuService->delete($menu);
        return redirect()->route('menus.index')->with('success', 'Menu deleted successfully.');
    }
}
