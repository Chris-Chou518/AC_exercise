const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const dataPanel = document.querySelector('#data-panel')
const MOVIES_PER_PAGE = 12
const paginator = document.querySelector('#paginator')
let filteredMovies = []
const modeChangeSwitch = document.querySelector('#change-mode')
let currentPage = 1

axios.get(INDEX_URL)
  .then(response => {
    // for (const movie of response.data.results){
    //   movies.push(movie)
    // }
    movies.push(...response.data.results)
    console.log(movies)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(currentPage))
  })
  .catch(error => {
    console.log(error)
  })

  function renderMovieList (data){
    if (dataPanel.dataset.mode ==='card-mode'){
      let rawHTML = ''
      //need image, title
      data.forEach((item) => {
        const image = item.image
        const title = item.title
        rawHTML += `
          <div class="card" style="width: 16rem;">
        <img src=${POSTER_URL + image} class="card-img-top" alt="move poster">
        <div class="card-body">
          <h5 class="card-title">${title}</h5>
        </div>

          <div class="card-footer ">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id = ${item.id}>more</button>
            <button class="btn btn-info btn-add-favorite" data-id = ${item.id}>+</button>
          </div>
      </div>
    `
      })
      dataPanel.innerHTML = rawHTML
    } else if (dataPanel.dataset.mode === 'list-mode'){
      let rawHTML =`<ul>`
      data.forEach(item =>{
        rawHTML += `
        <li class="list-group-item d-flex justify-content-between mb-2">
          <h5 class="card-title">${item.title}</h5>
          <div>
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id = ${item.id}>more</button>
            <button class="btn btn-info btn-add-favorite" data-id = ${item.id}>+</button>         
          </div>
         
        </li>
        `
      })
      rawHTML += '</ul>'
      dataPanel.innerHTML = rawHTML
    }
  }

//監聽dataPanel
  dataPanel.addEventListener('click', function onPanelClicked(event){
    if (event.target.matches('.btn-show-movie') ){
      console.log(Number(event.target.dataset.id))
      showMovieModal(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')){
      addToFavorite(Number(event.target.dataset.id))
    }
  })

  function showMovieModal (id){
    const movieModalTitle = document.querySelector('#movie-modal-title')
    const movieModalImage = document.querySelector('#movie-modal-image')
    const movieModalDate = document.querySelector('#movie-modal-date')
    const movieModalDescription = document.querySelector('#movie-modal-description')
    axios.get(INDEX_URL + '/' + id)
      .then(response=>{
        const data = response.data.results
        movieModalTitle.innerText = data.title
        movieModalDate.innerText = 'Release date: ' + data.release_date 
        movieModalDescription.innerText = data.description
        movieModalImage.innerHTML = `<img src="${POSTER_URL + data.image
          }" alt="movie-poster" class="img-fluid">`
      })
      .catch(error=>{
        console.log(error)
      })


  }

  // 監聽表單提交事件
const searchForm = document.querySelector('#search-form')  
const searchInput = document.querySelector('#search-input') //新增這裡
//...
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  console.log('yes')
  event.preventDefault()
  //新增以下
  const keyword = searchInput.value.trim().toLowerCase()
  
  // if (!keyword.length) {
  //   return alert('請輸入有效字串！')
  // }
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  //重製分頁器
  renderPaginator(filteredMovies.length)
  //重新render出畫面-- 預設顯示第一頁搜尋結果
  renderMovieList(filteredMovies)
})


//存取收藏清單 
function addToFavorite (id){
  console.log(id)//檢查事件綁定有無成功
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  const movie = movies.find(movie => movie.id === id)
  if (list.some(movie => movie.id === id)){
    return alert('此電影已在收藏中')
  }
  list.push(movie)
  localStorage.setItem("favoriteMovies", JSON.stringify(list))
}

//實作分頁......................

function getMoviesByPage (page){
  //新增這邊
    const data = filteredMovies.length? filteredMovies : movies
   //計算起始 index
  const startIndex = (page - 1) * MOVIES_PER_PAGE          
   //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作template
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages ; page++){
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = "${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML  
}

paginator.addEventListener('click', function onPaginatorClicked(event){
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return
  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  currentPage = page
  renderMovieList(getMoviesByPage(currentPage))
})

//依不同data-mode切換不同顯示方式
function changeDisplayMode (displayMode){
  if(dataPanel.dataset.mode === displayMode) return
  dataPanel.dataset.mode = displayMode
}

//設監聽切煥
modeChangeSwitch.addEventListener('click', event =>{
  if (event.target.matches('#list-mode-button')){
    changeDisplayMode('list-mode')
    renderMovieList(getMoviesByPage(currentPage))
  } else if (event.target.matches('#card-mode-button')){
    changeDisplayMode('card-mode')
    renderMovieList(getMoviesByPage(currentPage))
  }
})


