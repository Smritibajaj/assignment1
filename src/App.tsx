import React from 'react';
import './App.css';
import { Subject, of, from } from 'rxjs';
import { map, catchError, takeLast, skipLast, distinctUntilChanged } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

const source = ajax('/all');
const currentStream = new Subject();
interface Props { }
interface State {
  previousValue: any;
  currentValue: any;
  items: any;
  selectedItems: any;
};
class App extends React.Component<Props, State> {
  state: State = {
    previousValue: [],
    currentValue: [],
    items: [],
    selectedItems: [],
  };

  componentDidMount() {
    const getDataStream = source.pipe(map(res => this.setState({ items: [...res.response] })), catchError(error => {
      console.log('error: ', error);
      return of(error);
    }));
    getDataStream.subscribe();
  }
  shouldComponentUpdate(prevState:State, nextState:State):boolean{
    return prevState !== nextState ? true :false

  }
  componentDidUpdate() {
    this.initializeInputStream();
  }
  componentWillUnmount(){
    currentStream.unsubscribe(); 
  }
  initializeInputStream() {
    const lastTwoValue = from(this.state.selectedItems);
    currentStream.subscribe(val => this.setState({
      selectedItems: [...this.state.selectedItems, val]
    })
    );
    lastTwoValue.pipe(takeLast(2), skipLast(1), distinctUntilChanged()).subscribe(val => {
      if (this.state.previousValue !== val) {
        this.setState({ previousValue: val })
      }
    });
    lastTwoValue.pipe(takeLast(1)).subscribe(val => {
      if (this.state.currentValue !== val) {
        this.setState({ currentValue: val })
      }
    })
  }
  render() {
    return (
      <React.Fragment>
        <div className="custom-select">
        <h1 className="header">Plan Your Vacations</h1>
        <h2 className="header">Chosse a country to get package</h2>
          <select className="selectbox" id="style-2"
            onChange={(e) => { currentStream.next(e.target.value); }}>
            {this.state.items.map((item: any) => <option key={item.name}>{item.name}</option>)}
          </select>
        </div>
        <div className="section">
          <div>
            <h4>Previously Selected Countrry</h4>
            {(this.state.previousValue.length >= 1) ? <li>{this.state.previousValue}</li> : <></>}
          </div>
          <div>
            <h4>Currently Selected Country</h4>
            {(this.state.currentValue.length >= 1) ? <li>{this.state.currentValue}</li> : <></>}
          </div>
          <div>
            <h4>All Selected Countries</h4>
            {this.state.selectedItems ? this.state.selectedItems.map((val: any) => <li key={val}>{val}</li>) : <></>}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default App;
