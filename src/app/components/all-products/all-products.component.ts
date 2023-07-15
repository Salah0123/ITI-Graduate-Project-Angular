import { Component, DoCheck, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from 'src/app/services/order.service';
import { AllProductService } from 'src/app/services/product.service';
import { ShoppingCartService } from 'src/app/services/shopping-cart.service';

@Component({
  selector: 'app-all-products',
  templateUrl: './all-products.component.html',
  styleUrls: ['./all-products.component.scss'],
})
export class AllProductsComponent implements OnInit, DoCheck {
  products: any = [];
  errMessage: any;
  cart: any[] = [];
  isAdded: boolean = false;
  catID: any;
  currentPage = 1;
  productsPerPage = 8;

  constructor(
    private service: AllProductService,
    private shoppingSer: ShoppingCartService,
    private toastr: ToastrService,
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private orderSer: OrderService
  ) {}

  ngDoCheck(): void {
    this.products = this.service.productsArray;
  }

  ngOnInit(): void {
    this.catID = this.activatedRouter.snapshot.paramMap.get('cid');
    console.log(this.catID);
    if (!this.catID) {
      this.getAllProducts();
    } else {
      this.getProductsByCategory();
    }
  }

  getAllProducts() {
    this.service.getAllProducts().subscribe({
      next: (data: any) => {
        this.service.productsArray = data.products;
        // this.products = this.service.productsArray;
        this.products = data.products;
        console.log(data.products);
      },
      error: (err) => (this.errMessage = err),
    });
  }

  getProductsByCategory() {
    this.service.getProductsByCategory(this.catID).subscribe((res: any) => {
      this.products = res.doc;
      this.service.productsArray = res.doc;
    });
  }

  addToCart(event: any) {
    if (localStorage.getItem('Token')) {
      if(!localStorage.getItem("orderId")){



        let newOrderObj = {
          product: [
            {
              product: event._id,
              quantity: 1,
            },
          ],
        };

        this.orderSer.saveOrder(newOrderObj).subscribe((res: any)=>{
          console.log(res.message._id)
          localStorage.setItem('orderId',res.message._id);
          this.toastr.success('Product Added Successfully');
        })
      }else {
        let id = localStorage.getItem("orderId")
        // console.log(id)
        let updateOrderObj = {
          product: [
            {
              product: event._id,
              quantity: 1,
            },
          ],
        };

        this.orderSer.updateOrder(updateOrderObj, id).subscribe((res: any) => {
          console.log(res);
          this.toastr.success('Product Added Successfully');
        });
      }











      // let OrderObj = {
      //   product: event,
      //   quantity: 1,
      // };

      // let inCart = false;
      // if (this.shoppingSer.shoppingCart.length >= 1) {
      //   this.shoppingSer.shoppingCart.forEach((item: any) => {
      //     if (item.product._id == event._id) {
      //       inCart = true;
      //       return;
      //     }
      //   });
      //   if (inCart) {
      //     this.shoppingSer.shoppingCart.forEach((item: any) => {
      //       if (item.product._id == event._id) {
      //         if (item.quantity < item.product.quantity) {
      //           item.quantity++;
      //           console.log(item.quantity);
      //           console.log(item.product.quantity);
      //         } else {
      //           this.toastr.error('Quantity Is Not Available');
      //         }
      //         return;
      //       }
      //     });
      //   } else {
      //     this.shoppingSer.shoppingCart.push(OrderObj);
      //   }
      // } else {
      //   this.shoppingSer.shoppingCart.push(OrderObj);
      // }
      // this.toastr.success('Product Added Successfully');
    } else {
      this.toastr.error('login and try again');
      this.router.navigate(['/login']);
    }
  }

  next() {
    this.currentPage++;
  }

  prev() {
    this.currentPage--;
  }

  isPrevDisabled() {
    return this.currentPage === 1;
  }

  isNextDisabled() {
    return (
      this.currentPage ===
      Math.ceil(this.products.length / this.productsPerPage)
    );
  }
}
