export class ProductService {

async getProductList({page, pageSize, keyword}) {

	try {
			const url = new URL(`https://panda-market-api-crud.vercel.app/Products`);
 			if (page !== undefined) url.searchParams.append('page', page);
		  if (pageSize !== undefined) url.searchParams.append('pageSize', pageSize);
   		if (keyword !== undefined) url.searchParams.append('keyword', keyword);


			const response = await fetch(url);
 			   if (!response.ok) {
     			throw new Error(`HTTP Error ${response.status}`);
   				 }
  	 	 const result = await response.json();
  	 	 	return result; 
			} 
			 	catch (error) {
					if(error.response) {
						console.log(error.response.staus)
					}
						console.error('Fetch Error:', error.message);
  }
		
}


async getProduct(id) {

	try {
			const url = new URL(`https://panda-market-api-crud.vercel.app/Products/${id}`)
			
			const response = await fetch(url);
 			   if (!response.ok) {
     			throw new Error(`HTTP Error ${response.status}`);
   				 }
  	 	 const result = await response.json();
  	 	 	return result; 
			} 
			 	catch (error) {
					if(error.response) {
						console.log(error.response.staus)
					}
						console.error('Fetch Error:', error.message);
  }
		
}

async createProduct(images, tags, price, description, name) {

		try {
			const url = new URL(`https://panda-market-api-crud.vercel.app/Products`)
			
			const response = await fetch(url, {
				method : 'POST',
				headers: {
					'Content-Type': 'application/json'},
				body: JSON.stringify({ 
					images: images, 
					tags: tags,
					price: price, 
					description: description,
					name: name
				})
			})
			
		const result = await response.json(); 
		return result;
	}   
			catch (error) {
					if(error.response) {
						console.log(error.response.staus)
					}
						console.error('Fetch Error:', error.message);
  }
}


async patchProduct(id, name, description, price, tags, images) {
		
		try {
			const url = new URL(`https://panda-market-api-crud.vercel.app/Products/${id}`);

			const response = await fetch(url, {
				method : 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: name,
					description: description,
					price: price,
					tags: tags,
					images: images	
				})
			})
		const result = await response.json(); // await 지우기?
		return result;
	}   
			catch (error) {
					if(error.response) {
						console.log(error.response.staus)
					}
						console.error('Fetch Error:', error.message);
  }
}


async deleteProduct(id) {
	
		
		try {
			const url = new URL(`https://panda-market-api-crud.vercel.app/Products/${id}`);

			const response = await fetch(url, {
				method : 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
			})
			const result = await response.json(); // await 지우기?
			return result;
	}   
			catch (error) {
					if(error.response) {
						console.log(error.response.staus)
					}
						console.error('Fetch Error:', error.message);
  }

	}
			
}
