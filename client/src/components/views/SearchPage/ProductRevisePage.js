import SearchBar from '../SearchBar/SearchBar'
import React, { useEffect,useState } from 'react'
import { Link } from 'react-router-dom'
import { Grid, Button, Input, Image ,Item ,Card, Pagination} from 'semantic-ui-react'
import Axios from 'axios';
import { withRouter } from 'react-router-dom';
import CheckBox from './Sections/CheckBox'
import Dropdown from './Sections/Dropdown'
// import '../style/LPS.css';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import Sidebar from '../SideBar/SideBar';
import axios from 'axios';
import Sort from './Sections/Sort'
import {sortBy, price, computerPart} from './Sections/Datas'

const ProductRevisePage = (props) =>{
    const [SearchTerms, setSearchTerms] = useState("")
    const [Skip, setSkip] = useState(0)
    const [Limit, setLimit] = useState(8)
    const [Products, setProducts] = useState([])
    //post사이즈가 loadmore버튼 더이상 생기게 할 거 없으면 숨겨줌.
    const [PostSize, setPostSize] = useState(0)
    const [ActivePage, setActivePage] = useState(1)
    const [Allpage, setAllpage] = useState(1)
    const [Filters, setFilters] = useState({
        computerPart: [],
        price: [],
        sortBy: [],
    })
    const s3path = 'https://seonhwi.s3.amazonaws.com/'


    
  
    
    const updateSearchTerm = (newSearchTerm) => {
        const variables = {
            skip : 0,
            limit: Limit,
            filters: Filters,
            searchTerm : newSearchTerm
        }
        setSkip(0)
        setSearchTerms(newSearchTerm);
        getProducts(variables)
    }

    useEffect(() => {
        const variables = {
            skip: Skip,
            limit: Limit,
            filters: Filters
        }
        getProducts(variables)
    }, [])

    const getProducts = (variables) => {
        Axios.post('/api/product/getProducts', variables)
        .then(response => {
            //searchPage에서 바뀐부분.
            if(response.data.success){
                if(variables.loadMore){
                    //여기 바꿔야될듯..?
                    setProducts([...Products, ...response.data.products])
                }else{
                    setProducts(response.data.products)
                }
                setPostSize(response.data.postSize)
                setAllpage(response.data.allPage)
                console.log("length: "  + Allpage)

            }else{
                alert('Failed to fetch product datas')
            }
        })
    }

    //데이터 더 보여줌.
    //limit: fetch될 데이터 수 제한 위에서 skip은 0 limit은 8로 초기화
    //SKIP and LIMIT MONGODB method 사용
    //이거 활용해서 앞으로 뒤로가는거 만들겠음.
    const onLoadMore = () =>{

        let skip = Skip + Limit;
        const variables = {
            skip : skip,
            limit: Limit,

        }
        getProducts(variables)
        
        setSkip(skip)
    }

    const handlePaginationChange = (e, value) => {
        let skip = (value.activePage-1)*Limit;
        const variables = {
            skip : skip,
            limit: Limit,

        }
        getProducts(variables)
        setSkip(skip)
        setActivePage(value.activePage);
    }

    const deleteHandler = (value) =>{
        axios.post('/api/product/deleteProduct', value)
        .then(response => {
            if(response.data.success){
                alert("삭제완료")
                props.history.push("/adminpage")
                props.history.push("/product/revise")
                //여기 바꿔야될듯..?
            }else{
                alert('Failed to delete product')
            }
        })
    }
    
    const renderCards = Products.map((item, index) => {
        return (
                        <Item style={{display:'flex', marginBottom: '30px'}}>
                        <Item.Image size='small' src={`${s3path}${item.images[0]}`} />
                        <Item.Content>
                            <Item.Header>{item.title}</Item.Header>
                            <Item.Description></Item.Description>
                            <Item.Extra>
                                <Button primary floated='right' onClick={() => {deleteHandler(item)}}>삭제</Button>
                            </Item.Extra>
                        </Item.Content>
                        </Item>
     
                )
    })

    //필터처리한 품목들 보여줌.
    const showFilteredResults = (filters) => {

        const variables = {
            skip : 0,
            limit: Limit,
            filters: filters
        }
            getProducts(variables)
            setSkip(0)
    }

    //price 
    const handlePrice = (value) => {
        const data = price;
        let array= [];

        for( let key in data){
            if(data[key]._id === parseInt(value, 10)){
                array = data[key].array;
            }
        }
        return array
    }


    //부모 컴포넌트에 전달역할
    const handleFilters = (filters, cate) => {
        
        let arr = []
        const newFilters = {...Filters}
        
        newFilters[cate] = filters
        //있다가 할 것
        if(cate === "price"){
            let priceValues = handlePrice(filters)
            newFilters[cate] = priceValues
        }else if(cate === "sortBy"){
            newFilters[cate] = arr.concat([filters])
            
        }

        showFilteredResults(newFilters)
        setFilters(newFilters)
    }

    return (
        
        <div>
            <div style={{display:'flex', justifyContent:'space-between'}}>
                {/*Filter */}
                <div style={{display:'flex'}}>
                <CheckBox
                    list={computerPart} 
                    handleFilters={filters => handleFilters(filters, "computerPart")}
                />
                
                <Dropdown
                    list = {price}
                   handleFilters={filters => handleFilters(filters, "price")}
                />
                <Sort list= {sortBy}
                    handleFilters={filters => handleFilters(filters, "sortBy")}/>
                </div>
                {/*Search */}
                <div style={{display:'flex', justifyContent:'flex-end'}}>
                    <SearchBar
                    refreshFunction={updateSearchTerm}        
                    />
                </div>  
            </div>
            

                
            
            

        {Products.length === 0?
            <div style={{display: 'flex', height: '300px', justifyContent: 'center', alignItems: 'Center'}}>
                <h2>No post yet...</h2>
            </div> :
            <div style={{width: '75%', margin: '3rem auto'}}>
                <Item.Group>
                    {renderCards}
                </Item.Group>  
            </div>
        }
        {
            <div style={{ justifyContent: 'center', display: 'flex'}}>
                <Pagination defaultActivePage={1} totalPages={Allpage%8!==0 || Allpage===0 ? Math.ceil(Allpage/8) : Allpage/8} onPageChange={handlePaginationChange} />
            </div>
        }
        

        </div>

    )
}

export default withRouter(ProductRevisePage)