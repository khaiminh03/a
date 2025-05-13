
import BestSeller from "../components/BestSeller"
import BottomBanner from "../components/BottomBanner"
import Categoris from "../components/Categoris"
import Letter from "../components/Letter"
import MainBanner from "../components/MainBanner"


const Home = () => {
  return (
    <div className='mt-10'>
        <MainBanner/>
        <Categoris/>
        <BestSeller/>
        <BottomBanner/>
        <Letter/>
        
    </div>
  )
}

export default Home
