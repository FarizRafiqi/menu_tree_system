<?php

namespace App\Services;

use App\Models\Menu;
use App\Repositories\MenuRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MenuService
{
    public function __construct(private MenuRepository $menuRepository) {}

    public function list()
    {
        return $this->menuRepository->all();
    }

    public function create(array $data): Menu
    {
        // kalau parent_id ada tapi depth tidak dikirim → hitung otomatis
        if (!empty($data['parent_id']) && !isset($data['depth'])) {
            $parent = $this->menuRepository->find((int)$data['parent_id']);
            if (!$parent) {
                throw ValidationException::withMessages(['parent_id' => 'Parent not found.']);
            }
            $data['depth'] = (int)$parent->depth + 1;
        }

        return DB::transaction(fn() => $this->menuRepository->create($data));
    }

    public function update(Menu $menu, array $data): Menu
    {
        if (isset($data['parent_id']) && (int)$data['parent_id'] === (int)$menu->id) {
            throw ValidationException::withMessages(['parent_id' => 'Parent cannot be itself.']);
        }
        return DB::transaction(fn() => $this->menuRepository->update($menu, $data));
    }

    public function delete(Menu $menu): void
    {
        DB::transaction(fn() => $this->menuRepository->delete($menu));
    }
}
