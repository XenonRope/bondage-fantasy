import "./App.css";
import { USERNAME_MIN_LENGTH } from "bondage-fantasy-common";

function App() {
  return (
    <div className="font-bold">
      Bondage Fantasy. Account minimum length is {USERNAME_MIN_LENGTH}.
    </div>
  );
}

export default App;
