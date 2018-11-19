import React, {Component} from 'react';
import { Input, Icon, Table, Dimmer, Loader } from 'semantic-ui-react'
import request from 'superagent';


class App extends Component {

  constructor(props){
    super(props);
    this.state={
      url: '',
      issueList: [],
      issueCounts: {
        today: [],
        week: [],
        month: [],
        older: []
      },
      loaderState: false
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleChange(e){
    this.setState({url: e.target.value})
  }

  handleClick(){
   this.setState({issueList: [], loaderState:true}, ()=>{
     var url = 'https://api.github.com/repos/'+this.state.url+'/issues'
     request
      .get(url)
      .then(res => {/
        var linkData = res.header.link.split(',')
        var totalPages = 0;
        linkData.map((item, key)=>{
          if(item.includes('rel="last"')){
            var index = item.indexOf('rel="last"');
            totalPages = parseInt(item.substring(index-4, index-3))
            var counter = 1;
            var tempArray = []
            while(counter <= totalPages ){
              tempArray.push(counter)
              counter += 1;
            }
            var count = 0;
            tempArray.map((item, key)=>{
              var page = key + 1
                , repoUrl = 'https://api.github.com/repos/'+this.state.url+'/issues?page='+page;
              request
               .get(repoUrl)
               .then(res => {
                 count += 1;
                 var tempIssueArr = this.state.issueList
                 tempIssueArr = tempIssueArr.concat(res.body)
                 this.setState({issueList: tempIssueArr})
                 if(count == totalPages){
                   var today = []
                     , week = []
                     , month = []
                     , older = []
                   this.state.issueList.map((issue, index)=>{
                     // console.log(issue.created_at);
                     var issueCreationDate = new Date(issue.created_at);
                     var currentDate = new Date();
                     var timeDiff = currentDate.getTime() - issueCreationDate.getTime();
                     var daysDiff = timeDiff / (1000 * 3600 * 24);
                     if(daysDiff < 1){
                       today.push(issue)
                     }
                     else if(daysDiff > 0 && daysDiff < 8){
                       week.push(issue)
                     }
                     else if(daysDiff > 7 && daysDiff < 32){
                       month.push(issue)
                     }
                     else{
                       older.push(issue)
                     }
                   })
                   var tempIssueObject = {
                     today: today,
                     week: week,
                     month: month,
                     older: older
                   }
                   this.setState({issueCounts: tempIssueObject, loaderState: false})
                 }
               });
            })
          }
        })
      });
   })
  }

  render() {
    return (
      <div style={{margin: '30px'}}>
        <Dimmer active={this.state.loaderState}>
          <Loader />
        </Dimmer>
        <Input icon={<Icon name='search' inverted circular link onClick={this.handleClick} />} placeholder='Enter the url of the repository...' onChange={this.handleChange} value={this.state.url}/>
          <Table celled>
           <Table.Header>
             <Table.Row>
               <Table.HeaderCell>Today</Table.HeaderCell>
               <Table.HeaderCell>Week</Table.HeaderCell>
               <Table.HeaderCell>Month</Table.HeaderCell>
               <Table.HeaderCell>Older</Table.HeaderCell>
             </Table.Row>
           </Table.Header>

           <Table.Body>
             <Table.Row>
               <Table.Cell>
                 {this.state.issueCounts.today.length}
               </Table.Cell>
               <Table.Cell>
                 {this.state.issueCounts.week.length}
               </Table.Cell>
               <Table.Cell>
                 {this.state.issueCounts.month.length}
               </Table.Cell>
               <Table.Cell>
                 {this.state.issueCounts.older.length}
               </Table.Cell>
             </Table.Row>
           </Table.Body>
         </Table>
      </div>
    );
  }
}

export default App;
