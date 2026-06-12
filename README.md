# Stockroom — Inventory Frontend (Vue 3 + Vite + Tailwind)

A Vue 3 admin interface for the Laravel `Category` / `Product` models: a navbar,
list views with view/edit/delete icons, create/edit forms, detail pages, and a
home dashboard summarizing stock.

## 1. Install & run

```bash
npm install
cp .env.example .env
# edit .env to point VITE_API_BASE_URL at your Laravel API
npm run dev
```

The app expects the Laravel API at `VITE_API_BASE_URL` (default
`http://localhost:8000/api`).

## 2. Required Laravel routes

In `routes/api.php`:

```php
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;

Route::apiResource('categories', CategoryController::class);
Route::apiResource('products', ProductController::class);
```

This gives you:

| Method | URI                  | Action  |
|--------|----------------------|---------|
| GET    | /api/categories      | index   |
| POST   | /api/categories      | store   |
| GET    | /api/categories/{id} | show    |
| PUT    | /api/categories/{id} | update  |
| DELETE | /api/categories/{id} | destroy |

(same pattern for `/api/products`)

## 3. Controller relations the frontend relies on

- **ProductController@index / @show** — eager-load the category so the product
  list/detail can show the category name and link back to it:

  ```php
  public function index()
  {
      return Product::with('category')->latest()->get();
  }

  public function show(Product $product)
  {
      return $product->load('category');
  }
  ```

- **CategoryController@show** — eager-load products so the category detail page
  can list everything in that category:

  ```php
  public function show(Category $category)
  {
      return $category->load('products');
  }
  ```

## 4. Validation (for the 422 error display in forms)

```php
// CategoryController@store / @update
$data = $request->validate([
    'name' => 'required|string|max:255',
    'description' => 'nullable|string',
    'is_active' => 'boolean',
]);

// ProductController@store / @update
$data = $request->validate([
    'category_id' => 'required|exists:categories,id',
    'name' => 'required|string|max:255',
    'description' => 'nullable|string',
    'price' => 'required|numeric|min:0',
    'stock' => 'required|integer|min:0',
    'is_active' => 'boolean',
]);
```

The frontend reads `error.response.data.errors` (Laravel's default
`ValidationException` shape) and shows each message under its field.

## 5. CORS (since this is a separate repo/origin)

In `config/cors.php`:

```php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:5173'], // add your deployed frontend URL too
'allowed_headers' => ['*'],
'supports_credentials' => false,
```

This setup uses simple JSON requests with no cookies, so
`supports_credentials` can stay `false` and `withCredentials` in
`src/api/axios.js` stays `false`. If you later add Sanctum cookie auth, flip
both to `true` and set `SANCTUM_STATEFUL_DOMAINS`.

## 6. Project structure

```
src/
  api/            axios instance + categories/products API modules
  components/     NavBar, StockGauge (stock-level indicator), ConfirmDialog
  views/
    HomeView.vue          dashboard: totals, low-stock, latest entries
    CategoryListView.vue  table with view/edit/delete icons
    CategoryFormView.vue  create/edit category
    CategoryDetailView.vue
    ProductListView.vue   table with category, price, stock gauge, status
    ProductFormView.vue   create/edit product
    ProductDetailView.vue
  router/         routes for all of the above
```

## Design notes

The UI uses a dark "ledger" theme (Space Grotesk for headings, Inter for body,
JetBrains Mono for numbers/IDs/prices) with a small **stock gauge** — a 5-tick
bar next to every product's stock count that turns rust/amber/sage depending
on whether it needs reordering. The home page surfaces a "Needs reordering"
list driven by the same thresholds.
