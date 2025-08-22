<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tree = [
            [
                'name' => 'System Management',
                'children' => [
                    [
                        'name' => 'Systems',
                        'children' => [
                            [
                                'name' => 'System Code',
                                'children' => [
                                    ['name' => 'Code Registration'],
                                    ['name' => 'Code Registration - 2'],
                                ],
                            ],
                            ['name' => 'Properties'],
                            [
                                'name' => 'Menus',
                                'children' => [
                                    ['name' => 'Menu Registration'],
                                ],
                            ],
                            [
                                'name' => 'API List',
                                'children' => [
                                    ['name' => 'API Registration'],
                                    ['name' => 'API Edit'],
                                ],
                            ],
                        ],
                    ],
                    [
                        'name' => 'Users & Groups',
                        'children' => [
                            [
                                'name' => 'Users',
                                'children' => [
                                    ['name' => 'User Account Registration'],
                                ],
                            ],
                            [
                                'name' => 'Groups',
                                'children' => [
                                    ['name' => 'User Group Registration'],
                                ],
                            ],
                            [
                                'name' => '사용자 승인',
                                'children' => [
                                    ['name' => '사용자 승인 상세'],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        DB::transaction(function () use ($tree) {
            $now = now();

            $insertNode = function (array $node, int $depth = 0, ?string $parentId = null) use (&$insertNode, $now) {
                // insert node
                $menu = Menu::create([
                    'id' => Str::uuid(),
                    'name' => $node['name'],
                    'depth' => $depth,
                    'parent_id' => $parentId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                // children (kalau ada)
                foreach (($node['children'] ?? []) as $child) {
                    $insertNode($child, $depth + 1, $menu->id);
                }
            };

            foreach ($tree as $root) {
                $insertNode($root, 0, null);
            }
        });
    }
}
