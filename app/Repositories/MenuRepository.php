<?php

namespace App\Repositories;

use App\Models\Menu;
use Illuminate\Support\Collection;

class MenuRepository
{
    public function all(): Collection
    {
        return Menu::query()->orderBy('depth')->orderBy('id')->get();
    }

    public function create(array $data): Menu
    {
        return Menu::create($data);
    }

    public function update(Menu $menu, array $data): Menu
    {
        $menu->fill($data)->save();
        return $menu;
    }

    public function delete(Menu $menu): void
    {
        $menu->delete();
    }

    public function find(int $id): ?Menu
    {
        return Menu::find($id);
    }
}
