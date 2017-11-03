import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import * as reducers from '../shared/reducers';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnInit {
  @ViewChild('editor') editor;

  actions = [
    {type: '[Client] Select', payload: {id: '1', firstName: 'John', lastName: 'Doe', company: 'Acme, Inc'}},
    {type: '[Client] Select', payload: {id: '2', firstName: 'Jane', lastName: 'Smith', company: 'Super, Inc'}},
    {type: '[Client] Select', payload: {id: '1', firstName: 'John', lastName: 'Doe', company: 'Acme, Inc'}},
    {type: '[Client] Select', payload: {id: '2', firstName: 'Jane', lastName: 'Smith', company: 'Super, Inc'}},
    {type: '[Client] Select', payload: {id: '1', firstName: 'John', lastName: 'Doe', company: 'Acme, Inc'}},
    {type: '[Client] Select', payload: {id: '2', firstName: 'Jane', lastName: 'Smith', company: 'Super, Inc'}},
  ];

  index = 0;
  timerInterval = 500;
  action = '{ "type": "[Client] Select", "payload": { "id": "1", "firstName": "John", "lastName": "Doe", "company": "Acme, Inc"}}';
  rawActions = `[
    { "type": "[Client] Select", "payload": { "id": "1", "firstName": "John", "lastName": "Doe", 	"company": "Acme, Inc"}},
    { "type": "[Client] Select", "payload": { "id": "2", "firstName": "Jane", "lastName": "Smith", 	"company": "Super, Inc"}},
    { "type": "[Client] Select", "payload": { "id": "1", "firstName": "John", "lastName": "Doe", 	"company": "Acme, Inc"}},
    { "type": "[Client] Select", "payload": { "id": "2", "firstName": "Jane", "lastName": "Smith", 	"company": "Super, Inc"}},
    { "type": "[Client] Select", "payload": { "id": "1", "firstName": "John", "lastName": "Doe", 	"company": "Acme, Inc"}},
    { "type": "[Client] Select", "payload": { "id": "2", "firstName": "Jane", "lastName": "Smith", 	"company": "Super, Inc"}}
  ]`;
  remoteActions: AngularFirestoreCollection<any>;

  constructor(private store: Store<reducers.AppState>, private afs: AngularFirestore) {
    this.remoteActions = afs.collection('actions');
  }

  ngOnInit() {
    // REMOTE DISPATCH
    this.remoteActions.valueChanges()
      .skip(1)
      .subscribe((actions: any) => {
        this.store.dispatch(actions[0]);
      });

    /* REMOTE PLAYBACK
    this.remoteActions.valueChanges()
      .subscribe((actions: any) => {
        this.actions = actions;
        this.cycle();
      });
      */

    this.editor.setTheme('monokai');

    this.editor.setMode('json');

    this.editor.getEditor().setOptions({
      enableBasicAutocompletion: true,
      showLineNumbers: false,
      showGutter: false,
      tabSize: 2
    });
  }


  // STEP O1: Manual step
  step() {
    this.index = this.index < this.actions.length - 1 ? this.index + 1 : 0;
    this.store.dispatch(this.actions[this.index]);

  }

  // STEP O2: Manual cycle
  cycle() {
    const that = this;
    const result = Observable
      .from(this.actions)
      .zip(Observable.interval(this.timerInterval), (a, b) => {
        // THIS IS NAUGHTY!
        this.index = b;
        // THIS IS AWESOME!
        return a;
      })
    ;

    result.subscribe(action => this.store.dispatch(action));
  }

  // STEP O3: Dynamic step
  dispatch(action) {
    this.store.dispatch(JSON.parse(action));
  }

  // STEP O4: Dynamic cycle
  dispatchCycle(rawActions) {
    const actions = JSON.parse(rawActions);
    const result = Observable
      .from(actions)
      .zip(Observable.interval(this.timerInterval), (a, b) => a)
    ;

    result.subscribe((action: any) => this.store.dispatch(action));
  }

  // STEP 05: Remote step
  dispatchRemote(action) {
    this.remoteActions.add(JSON.parse(action));
  }

  // HISTORY
  undo() {
    this.store.dispatch({type: 'UNDO'});
  }

  redo() {
    this.store.dispatch({type: 'REDO'});
  }
}
