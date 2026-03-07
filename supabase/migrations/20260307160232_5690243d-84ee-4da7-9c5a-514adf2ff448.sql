
INSERT INTO public.menu_categories (id, name, description, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Street Food Favorites', 'Popular Tanzanian street food classics', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Grilled Specialties', 'Smoky grilled meats and seafood', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Rice & Curry', 'Traditional rice dishes with rich curries', 3),
  ('c1000000-0000-0000-0000-000000000004', 'Snacks & Sides', 'Light bites and side dishes', 4),
  ('c1000000-0000-0000-0000-000000000005', 'Drinks & Desserts', 'Refreshing drinks and sweet treats', 5);

INSERT INTO public.menu_items (name, description, price, category_id, rating, is_spicy, is_vegetarian, is_vegan, is_gluten_free, calories, prep_time, is_featured) VALUES
  ('Bomba Box', 'Our signature fried chicken with spiced fries, coleslaw and drink', 15000, 'c1000000-0000-0000-0000-000000000001', 4.9, true, false, false, true, 680, 12, true),
  ('Chicken Baga', 'Crispy chicken burger with our secret Kookoos sauce and pickles', 12000, 'c1000000-0000-0000-0000-000000000001', 4.8, false, false, false, false, 520, 10, true),
  ('Crispy Wings', 'Golden crispy chicken wings with tangy orange chili sauce', 8000, 'c1000000-0000-0000-0000-000000000001', 4.7, true, false, false, true, 380, 12, true),
  ('Beef Mishkaki', 'Grilled beef skewers marinated in traditional Tanzanian spices', 13000, 'c1000000-0000-0000-0000-000000000002', 4.8, true, false, false, true, 320, 15, false),
  ('Grilled Chicken Quarter', 'Flame-grilled quarter chicken with herb butter', 10000, 'c1000000-0000-0000-0000-000000000002', 4.6, false, false, false, true, 420, 18, false),
  ('Fish Tikka', 'Spiced grilled fish fillet with lemon and herbs', 14000, 'c1000000-0000-0000-0000-000000000002', 4.5, true, false, false, true, 290, 15, false),
  ('Chicken Pilau', 'Aromatic rice dish with tender chicken and warm spices', 15000, 'c1000000-0000-0000-0000-000000000003', 4.7, false, false, false, false, 450, 20, false),
  ('Chicken Biryani', 'Fragrant basmati rice layered with spiced chicken', 16000, 'c1000000-0000-0000-0000-000000000003', 4.8, true, false, false, false, 520, 25, true),
  ('Wali Maharage', 'Rice and beans - a Tanzanian classic comfort meal', 6000, 'c1000000-0000-0000-0000-000000000003', 4.4, false, true, true, true, 350, 15, false),
  ('Vegetable Samosas', 'Crispy pastries filled with spiced vegetables', 5000, 'c1000000-0000-0000-0000-000000000004', 4.6, false, true, true, false, 180, 8, false),
  ('Chips Mayai', 'Tanzanian French fries omelette - street food classic', 7000, 'c1000000-0000-0000-0000-000000000004', 4.5, false, true, false, false, 420, 10, false),
  ('Kachumbari Salad', 'Fresh tomato, onion, and cilantro salad with lime', 3000, 'c1000000-0000-0000-0000-000000000004', 4.3, false, true, true, true, 60, 5, false),
  ('Fresh Juice', 'Freshly squeezed tropical fruit juice of the day', 4000, 'c1000000-0000-0000-0000-000000000005', 4.6, false, true, true, true, 120, 5, false),
  ('Tangawizi', 'Spiced ginger drink - refreshing and warming', 3000, 'c1000000-0000-0000-0000-000000000005', 4.5, false, true, true, true, 80, 3, false),
  ('Kashata', 'Traditional coconut and sugar candy dessert', 3500, 'c1000000-0000-0000-0000-000000000005', 4.4, false, true, true, true, 200, 2, false);

INSERT INTO public.stores (name, address, phone, hours, latitude, longitude, is_flagship) VALUES
  ('Bahari Beach', 'Bahari Beach Road, Dar es Salaam', '+255 123 456 789', '10:00 AM - 11:00 PM', -6.7924, 39.2889, true),
  ('Tegeta', 'Tegeta Ward, Kinondoni District', '+255 123 456 790', '11:00 AM - 10:00 PM', -6.7400, 39.2600, false),
  ('Sinza', 'Sinza Ward, Kinondoni District', '+255 123 456 791', '11:00 AM - 10:00 PM', -6.7700, 39.2400, false);

INSERT INTO public.daily_specials (title, description, discount_percent, day_of_week, is_active) VALUES
  ('Monday Madness', '20% off all Bomba Boxes every Monday!', 20, 1, true),
  ('Wing Wednesday', 'Buy 1 get 1 free on Crispy Wings', 50, 3, true),
  ('Family Friday', '15% off orders over TSh 50,000', 15, 5, true),
  ('Weekend Special', 'Free drink with any Biryani order', 0, NULL, true);
