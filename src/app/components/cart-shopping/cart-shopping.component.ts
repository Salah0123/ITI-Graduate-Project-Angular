import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { Toast, ToastrService } from 'ngx-toastr';
import { OrderService } from 'src/app/services/order.service';
import { ShoppingCartService } from 'src/app/services/shopping-cart.service';

@Component({
  selector: 'app-cart-shopping',
  templateUrl: './cart-shopping.component.html',
  styleUrls: ['./cart-shopping.component.scss'],
})
export class CartShoppingComponent {
  selectedSize: string = '';
  Quantity: number = 1;
  count: number = 1;
  cart: any[] = [];
  finalCart: any[] = [];
  subTotal: number = 0;
  total: number = 0;
  notAllowed: boolean = true;

  constructor(
    private shoppingSer: ShoppingCartService,
    private http: HttpClient,
    private orderSer: OrderService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if(localStorage.getItem("orderId")){
      this.getCartFromDB();
    }
    // this.getCart();
  }

  ngOnDestroy(): void {
    if (localStorage.getItem('orderId')){
      this.updateFullOrder();
    }
  }

  updateFullOrder() {
    let newCart = this.cart.map((item) => {
      return {
        product: item.product._id,
        quantity: item.quantity,
      };
    });
    let model = {
      product: newCart,
    };
    const id = localStorage.getItem('orderId');
    this.orderSer.updateFullOrder(model, id).subscribe((res: any) => {
      console.log(res);
      this.getCart();
    });
  }

  getCartFromDB() {
    const id = localStorage.getItem('orderId');
    this.orderSer.getCartFromDB(id).subscribe((res: any) => {
      this.cart = res.doc[0].product;
      this.calculateTotal();
      this.getCart();
    });
  }

  calculateTotal(): void {
    let total = 0;
    console.log(this.cart);
    for (const item of this.cart) {
      total += item.quantity * item.product.price;
    }

    this.subTotal = total;
    if (this.subTotal < 601) {
      this.total = total + 60;
    } else {
      this.total = this.subTotal;
    }
  }

  selectSize(size: string, item: any) {
    this.selectedSize = size;
    item.product.size = size;
  }

  removeItem(id: any) {
    this.cart.map((item: any, index: any) => {
      if (item.product._id == id) {
        return this.cart.splice(index, 1);
      } else {
        return this.cart;
      }
    });
    this.calculateTotal();
    this.getCart();
  }

  plusOne(id: number) {
    const item = this.cart.find((item) => item.product._id === id);
    if (item && item.quantity < item.product.quantity) {
      item.quantity++;
      this.calculateTotal();
      this.getCart();
    } else {
      this.toastr.error('Quantity Is Not Available');
    }
  }

  minusOne(id: number) {
    const item = this.cart.find((item) => item.product._id === id);
    if (item && item.quantity > 1) {
      item.quantity--;
      this.calculateTotal();
      this.getCart();
    }
  }

  completeOrder() {
    this.saveOrder();

    this.http
      .post('http://localhost:3000/checkout', {
        cart: this.finalCart,
      })
      .subscribe(async (res: any) => {
        let stripe = await loadStripe(
          'pk_test_51MQCBUEwQJXCe3Mmc3FzTRZYqCMdD0Zuv4DOLtIGqNgPleXebjlaiU7YTIqWPkIk1AW3smZQAqZQDalZIwWqyqXC00fjMq75eL'
        );
        stripe?.redirectToCheckout({
          sessionId: res.id,
        });
      });
  }

  saveOrder() {
    let productId = this.cart.map((item: any) => {
      item.size = this.selectedSize;
      let newQuantity = { quantity: item.product.quantity - item.quantity };
      this.orderSer
        .changeQuantity(newQuantity, item.product._id)
        .subscribe((res: any) => {
          console.log(res);
        });
      return { product: item.product._id, quantity: item.Quantity };
    });
    let model = {
      status: "in progress"
    };
    this.orderSer.changeOrderStatus(model,localStorage.getItem("orderId")).subscribe((res:any)=>{
      localStorage.removeItem('orderId');
    })




  }

  getCart() {
    let orderCart = this.cart
    this.finalCart = orderCart.map((item: any) => {
      item.product.Quantity = item.quantity;
      return item.product;
    });
  }
}

