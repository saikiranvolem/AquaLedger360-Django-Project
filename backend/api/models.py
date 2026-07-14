from django.db import models

class Product(models.Model):
    sku_name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    unit = models.CharField(max_length=50)
    stock = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=0)
    buy_price = models.DecimalField(max_digits=10, decimal_places=2)
    sell_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.sku_name

class Customer(models.Model):
    customer_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    village = models.CharField(max_length=100)
    pond_size = models.CharField(max_length=50)
    outstanding_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    next_due_date = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=50, default='Active')

    def __str__(self):
        return f"{self.customer_id} - {self.name}"

class Invoice(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    sale_type = models.CharField(max_length=50) # Credit, Cash, UPI
    new_outstanding = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"INV-{self.id} - {self.customer.name}"

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField()
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)

class Payment(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    mode = models.CharField(max_length=50) # UPI, Cash, Bank
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"PAY-{self.id} - {self.customer.name}"

class Expense(models.Model):
    date = models.DateField(auto_now_add=True)
    category = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    mode = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.category} - {self.amount}"