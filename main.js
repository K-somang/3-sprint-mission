import { ArticleService } from './ArticleService.js'
import { ProductService } from './ProductService.js'

const api = new ArticleService();
const api2 = new ProductService();


console.log(await api.getArticleList(1,10,"")) 
console.log(await api.getArticle(1477)) 

console.log(`----------------------11111------------------------------------`) 

console.log(await api.createArticle("https://example.com/...", "게시글 내용입니다.", "게시글 제목입니다.")) 


console.log(await api.patchArticle(1484,"https://example.com/...", "게시글의 내용입니다.", "게시글의 제목입니다."))

console.log(`---------------------22222-------------------------------------`)

console.log(await api.deleteArticle(1492)) 

console.log(`-----------------------333333-----------------------------------`)

console.log(await api2.getProductList(1,10,"")) 
console.log(await api2.getProduct(1029)) 
console.log(await api2.createProduct([], ["전자제품"], 49999, '가벼움', 'jun')) 
console.log(`-------------------------4444---------------------------------`)

console.log(await api2.patchProduct(1033,"상품 이름", "string",0, "전자제품", "https://example.com/..."))  
console.log(await api2.deleteProduct(1034))





class Product {
    constructor(name, description, price, tags, images, favoriteCount=0) {
        this._name=name;  //_ 클로저 사용
        this._description=description;
        this._price=price;
        this._tags=tags;
        this._images=images;
        this._favoriteCount=favoriteCount;
    }


		get name() {
			return this._name;
		}
		set name(name){
			this._name;
		}

			favorite() { 
            this._favoriteCount += 1;
        }
		
	}
const rect = new Product('jun', '가벼움', 50000, '전자제품', [] );
console.log(rect);




class EletronicProduct extends Product {
    constructor(name, description, price, tags, images, manufacturer, favoriteCount = 0) {
        super(name, description, price, tags, images, favoriteCount)
        this._manufacturer = manufacturer;

		}
	}
const rect2 = new EletronicProduct('jun', '가벼움', 50000, '전자제품', [], [])
console.log(rect2);




class Article {
    constructor(title, content, writer, likeCount) {
        this._title=title;
        this._content=content;
        this._writer=writer;
        this._likeCount=likeCount;
				this._createAt=new Date()
    }

		like() {
            this._likeCount +=1;
        }
}
const rect3 = new Article()
console.log(rect3);




const productList = await api2.getProductList({});

const products = productList.list.map(item => new Product(item.name, item.description, item.price,
	item.tags, item.images, item.favoriteCount
));

const products2 = productList.list.map(item => new EletronicProduct(item.name, item.description, item.price,
	item.tags, item.images, item.favoriteCount
));


console.log(products);
console.log(products2);

