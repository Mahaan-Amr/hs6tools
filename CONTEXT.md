# HS6Tools Storefront

The public catalog through which customers discover HS6Tools products and move from promotional entry points to purchasable product pages.

## Language

**Catalog Product**:
A product that is eligible to appear in the public storefront, whether it is currently in stock or out of stock.
_Avoid_: Loaded product, database product

**Product Category**:
A named grouping used by customers to browse related Catalog Products.
_Avoid_: Collection, product type

**Featured Category**:
A Product Category promoted through an image card or banner on the homepage.
_Avoid_: Homepage image, category tile

**Category Page**:
The public destination for a Product Category, presenting its identity and its visible Catalog Products.
_Avoid_: Category route, category screen

**All Products**:
The storefront view that presents Catalog Products without restricting them to one Product Category.
_Avoid_: Everything page, main shop

## Actors

**Visitor**:
A person browsing the public storefront without an authenticated account session.
_Avoid_: Guest user, anonymous buyer

**Customer**:
An authenticated person who can maintain personal commerce data such as addresses, orders, wishlists, reviews, and support conversations.
_Avoid_: Buyer, client, account

**Admin**:
An authenticated staff member permitted to operate day-to-day catalog, order, content, analytics, and support workflows.
_Avoid_: Manager, operator

**Super Admin**:
An Admin with authority over users, roles, system settings, and other restricted administrative capabilities.
_Avoid_: Root user, owner
