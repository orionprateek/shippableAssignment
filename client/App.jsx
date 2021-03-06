import React, {Component} from 'react';
import { Input, Icon, Table, Dimmer, Loader, Segment, Message } from 'semantic-ui-react'
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
      loaderState: false,
      segmentState: 'hidden',
      apiErrorMessage: ''
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleChange(e){
    this.setState({url: e.target.value})
  }


  handleClick(){
   this.setState({issueList: [], loaderState:true, segmentState: 'hidden'}, ()=>{
     var url = 'https://api.github.com/repos/'+this.state.url+'/issues'
     request
      .get(url)
      .end((data, res) => {
        if(res.statusCode == 403){
          console.log('Forbidden Request');
          console.log('Github sent an error: ', res.body.message);
          var resetIssueCounts = {
            today: [],
            week: [],
            month: [],
            older: []
          }
          this.setState({loaderState: false, apiErrorMessage: res.body.message, segmentState: 'visible', issueCounts: resetIssueCounts})
        }
        else if(res.statusCode == 200){
          // console.log('Response');
          // console.log('response: ', res);
          var linkData = res.header.link.split(',')
          var totalPages = 0;
          linkData.map((item, key)=>{
            if(item.includes('rel="last"')){
              var tempLinkDetails = item.split(';')
              var linkDataArray = tempLinkDetails[0].split('=')
              var pageString = linkDataArray[1].slice(0, -1)
              totalPages = parseInt(pageString)
              // console.log('Printing total pages :', totalPages);
              var counter = 1;
              var tempArray = []
              while(counter <= totalPages ){
                tempArray.push(counter)
                counter += 1;
              }
              var count = 0;
              tempArray.map((item, key)=>{
                // console.log('Inside TempArray map');
                var page = key + 1
                  , repoUrl = 'https://api.github.com/repos/'+this.state.url+'/issues?page='+page;
                request
                 .get(repoUrl)
                 .end((data, res) => {
                   if(res.statusCode == 403){
                     // console.log('Forbidden Request');
                     // console.log('Github sent an error: ', res.body.message);
                     var resetIssueCounts = {
                       today: [],
                       week: [],
                       month: [],
                       older: []
                     }
                     this.setState({loaderState: false, apiErrorMessage: res.body.message, segmentState: 'visible', issueCounts: resetIssueCounts})
                   }
                   else if(res.statusCode == 200){
                     // console.log('Inside nested response');
                     count += 1;
                     // console.log('Page Issue Count: ', res.body.length);
                     var tempIssueArr = this.state.issueList
                     tempIssueArr = tempIssueArr.concat(res.body)
                     this.setState({issueList: tempIssueArr})
                     if(count == totalPages){
                       var today = []
                         , week = []
                         , month = []
                         , older = []
                       var pullCounts = 0;
                       this.state.issueList.map((issue, index)=>{
                         // console.log('Index: ', index);

                         if ('pull_request' in issue){
                           // console.log('Pull Request');
                           pullCounts = pullCounts + 1;
                         }
                         else{
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
                         }
                       })

                       // console.log('pullCounts: ', pullCounts);
                       var tempIssueObject = {
                         today: today,
                         week: week,
                         month: month,
                         older: older
                       }
                       this.setState({issueCounts: tempIssueObject, loaderState: false})
                     }
                   }
                   else{
                     console.log('Unexpected Error');
                     var message = 'Unexpected error occured'
                     var resetIssueCounts = {
                       today: [],
                       week: [],
                       month: [],
                       older: []
                     }
                     this.setState({loaderState: false, apiErrorMessage: message, segmentState: 'visible', issueCounts: resetIssueCounts})
                   }
                 });
              })
            }
          })
        }
        else{
          console.log('Unexpected Error');
          var message = 'Unexpected error occured'
          var resetIssueCounts = {
            today: [],
            week: [],
            month: [],
            older: []
          }
          this.setState({loaderState: false, apiErrorMessage: message, segmentState: 'visible', issueCounts: resetIssueCounts})
        }
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
         <Segment raised style={{visibility: this.state.segmentState}}>
           <Message negative>
              <Message.Header>Forbidden Request</Message.Header>
                <p>
                  <span>Github sent an error</span>
                  <span>{this.state.apiErrorMessage}</span>
                </p>
              </Message>
         </Segment>
      </div>
    );
  }
}

export default App;
