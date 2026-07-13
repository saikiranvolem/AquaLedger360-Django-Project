from django.db import models

class Product(models.Model):
    # ... (Keep your existing Product code here) ...
    sku_name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    unit = models.CharField(max_length=50)
    stock = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=0)
    buy_price = models.DecimalField(max_digits=10, decimal_places=2)
    sell_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.sku_name

# ADD THIS NEW CLASS:
class Customer(models.Model):
    customer_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    village = models.CharField(max_length=100)
    pond_size = models.CharField(max_length=50)
    outstanding_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    next_due_date = models.CharField(max_length=50, blank=True, null=True) # Using CharField for simple display like "18 Jul"
    status = models.CharField(max_length=50, default='Active')

    def __str__(self):
        return f"{self.customer_id} - {self.name}"