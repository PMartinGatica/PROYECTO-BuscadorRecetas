function iniciarApp() {
    obtenerCategorias();
    
    const resultado = document.querySelector('#resultado');
    const selectCategorias = document.querySelector('#categorias');
    if (selectCategorias) {
        selectCategorias.addEventListener('change' , seleccionarCategorias);
        obtenerCategorias();
    }
    const favoritosDiv = document.querySelector('.favoritos');
    if (favoritosDiv) {
        obtenerFavoritos();
    }
    const modal = new bootstrap.Modal('#modal',{});

    function obtenerCategorias() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(respuesta =>mostrarCategorias(respuesta.categories))
    }

    function  mostrarCategorias(categorias = []) {
       categorias.forEach(categoria =>{
        const option = document.createElement('option');
        option.value = categoria.strCategory
        option.textContent = categoria.strCategory
        // console.log(option);
        // console.log(categoria);
        selectCategorias.appendChild(option)
       })

    }

    function seleccionarCategorias(e) {
        const categoria = e.target.value
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`

        fetch(url) 
            .then(respuesta =>respuesta.json())
            .then(resultado => mostrarRecetas(resultado.meals))
    }
    function mostrarRecetas(recetas =[]) {

        limpiarHTML(resultado);

        const heading = document.createElement('h2');
        heading.classList.add('text-center','text-white','my-5');
        heading.textContent = recetas.length ? 'Results' : 'No results';
        resultado.appendChild(heading);

        //Iterar resultados
        recetas.forEach(receta => {
            const {idMeal,
                strMeal,
                strMealThumb} = receta;
            const recetaContenedor = document.createElement('div');
            recetaContenedor.classList.add('col-md-4');

            const recetaCard = document.createElement('div');
            recetaCard.classList.add('card','mb-4');

            const recetaImg = document.createElement('img');
            recetaImg.classList.add('card-img-top');
            recetaImg.alt = `Imagen de la receta ${strMeal ?? receta.titulo}`;
            recetaImg.src =strMealThumb ?? receta.img ;

            const recetaCardBody = document.createElement('div');
            recetaCardBody.classList.add('card-body');

            const recetaHeading = document.createElement('h3');
            recetaHeading.classList.add('card-title','h3');
            recetaHeading.textContent =strMeal ?? receta.titulo;

            const recetaButton = document.createElement('button');
            recetaButton.classList.add('btn','btn-danger','w-100');
            recetaButton.textContent = 'See Recipe';
            // recetaButton.dataset.bsTarget = "#modal";
            // recetaButton.dataset.bsToggle = "modal";
            recetaButton.onclick = function ()  {
                seleccionarReceta(idMeal ?? receta.id);
            }

            //inyectar en HTML

            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImg);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard);

            resultado.appendChild(recetaContenedor);

            //console.log(recetaImg)
            // console.log(recetaCard)
        });
    }

    function seleccionarReceta(id) {
        // console.log(id);
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
        .then(respuesta=> respuesta.json())
        .then(resultado=> mostrarRecetaModal(resultado.meals[0]));
    }

    function mostrarRecetaModal(receta) {
       //muestra el modal
       console.log(receta);
       const {idMeal,strInstructions,strMeal,strMealThumb,strYoutube} = receta;

       //Añadir contenido al modal
       const modalTitle = document.querySelector('.modal .modal-title');
       const modalBody = document.querySelector('.modal .modal-body');
       

       //Muestra el modal title
       modalTitle.textContent = strMeal;
       modalBody.innerHTML = `
           <img class = "img-fluid" src="${strMealThumb}" alt="receta ${strMeal}"/>
           <h3 class="my-3">Video</h3>
           <a href=${strYoutube} target="_blank">View recipe on YouTube</a>
           <h3 class="my-3">Instructions</h3> 
           <p>${strInstructions}</p>
           <h3 class="my-3">Ingredients and Quantities</h3>
       `;

       const listGroup = document.createElement('ul');
       listGroup.classList.add('list-group');
       //Agregar ingredientes y cantidades
        for (let i = 1; i <= 20; i++) {
            if(receta[`strIngredient${i}`]){
                const ingredientes = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredientesLi = document.createElement('li');
                ingredientesLi.classList.add('list-group-item');
                ingredientesLi.textContent = `${ingredientes} - ${cantidad}`

                listGroup.appendChild(ingredientesLi);

            }
            
        }
        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer');
        limpiarHTML(modalFooter);

        //Botones de cerrar y favorito
        const btnFavorito = document.createElement('button');
        btnFavorito.classList.add('btn','btn-danger','col');
        btnFavorito.textContent = existeStorage(idMeal) ? 'Delete Bookmarks' : 'Bookmarks';

        //LocalStoreage
        btnFavorito.onclick = function () {
            if (existeStorage(idMeal)) {
            eliminarFavorito(idMeal);
            btnFavorito.textContent = "Bookmarks" 
            mostrarToast('Delete');
             return;   
            }

            agregarFavorito({
                id:idMeal,
                titulo:strMeal,
                img:strMealThumb
            });
            btnFavorito.textContent = "Delete Bookmarks";
            mostrarToast('Added to bookmarks');
        }
        
        const btnCerrar = document.createElement('button');
        btnCerrar.classList.add('btn','btn-secondary','col');
        btnCerrar.textContent = 'Close';
        btnCerrar.onclick = function () {
            modal.hide();
        }

        modalFooter.appendChild(btnFavorito)
        modalFooter.appendChild(btnCerrar)

       modal.show();
    }

    function agregarFavorito(receta) {
        //console.log('receta')
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos',JSON.stringify([...favoritos,receta]));
    }
    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id);
        localStorage.setItem('favoritos',JSON.stringify(nuevosFavoritos));
    }
    function existeStorage(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favoritos.some(favorito => favorito.id === id);
    }
    function mostrarToast(mensaje) {
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;
        toast.show();
    }
    function obtenerFavoritos() {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        if (favoritos.length){
            mostrarRecetas(favoritos);
            return
        } 
        const noFavoritos = document.createElement('p');
        noFavoritos.textContent ='No Bookmarks';
        noFavoritos.classList.add('fs-4','text-center','font-bold','mt-5');
        resultado.appendChild(noFavoritos);
    }
    
    function limpiarHTML(selector){
        while(selector.firstChild){
            selector.removeChild(selector.firstChild);
        }
    }

}

document.addEventListener('DOMContentLoaded',iniciarApp);

