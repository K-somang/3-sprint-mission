import axios from 'axios';
export class ArticleService {

getArticleList({page, pageSize, keyword}) {
			
			return axios.get(`https://panda-market-api-crud.vercel.app/articles`,
				{params: {page, pageSize, keyword},})

			.then (response => {return response.data;})
			.catch(error => {if(error.response) {console.error(`에러 발생:`, error.response.status, error.response.statusText);}})
			
			.catch(error => {console.error('Error!:', error);})
	}


		

getArticle(id) {

		return axios.get(`https://panda-market-api-crud.vercel.app/articles/${id}`)

		.then (response => {return response.data;})
		.catch(error => {if(error.response) {console.error(`에러 발생:`, error.response.status, error.response.statusText);}})
			
			
		.catch(error => {console.error('Error!:', error);}) 
	}



createArticle(image, content, title) {
			
			return fetch(`https://panda-market-api-crud.vercel.app/articles`,  
		  {method : 'POST',
				headers: {
					'Content-Type': 'application/json'},
				body: JSON.stringify({ 
					image: image,
					content: content,
					title: title })
			})

			.then(response => {
   			 if (!response.ok) { console.error('에러 발생:', response.status, response.statusText);
    		  throw new Error(`HTTP error! status: ${response.status}`);}
  			  return response.json();
			  })
 				 .catch(error => {
   				console.error('catch에서 처리:', error.message);
 		 });
}



async patchArticle(id, image, content, title) {

			return fetch(`https://panda-market-api-crud.vercel.app/articles/${id}`, {
				method : 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
				  image,
					content,
					title,
				})
			})
		.then(response => {
   			 if (!response.ok) {
     		 console.error('에러 발생:', response.status, response.statusText);
    		  throw new Error(`HTTP error! status: ${response.status}`);
			    }
  			  return response.json();
			  })
				.catch(error => {if(error.response) {console.error(`에러 발생:`, error.response.status, error.response.statusText);}})
				.catch(error => {console.error('catch에서 처리:', error.message);
 		 });
	}



async deleteArticle(id) {
	
			return fetch(`https://panda-market-api-crud.vercel.app/articles/${id}`, {
				method : 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
			})
				.then(response => {
   			 if (!response.ok) {
     		 console.error('에러 발생:', response.status, response.statusText);
    		  throw new Error(`HTTP error! status: ${response.status}`);
			    }
  			  return response.json();
			  })
				.catch(error => {if(error.response) {console.error(`에러 발생:`, error.response.status, error.response.statusText);}})
				.catch(error => {console.error('catch에서 처리:', error.message);
 		 });
	}
}

