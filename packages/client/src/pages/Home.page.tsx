import { Link as NavigateLink } from 'react-router-dom';
// importing components
import { PageBase } from '../components/PageBase';

const Home = () => {
    return (
        <PageBase>
            <h1>Home</h1>
            <p><NavigateLink to='/test'>To Test</NavigateLink></p>
        </PageBase>
    );
};

export default Home;