import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { fromEvent, Observable, of, Subject } from 'rxjs';
import {
  map,
  share,
  switchMap,
  takeLast,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs/operators';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  loading: boolean = false;
  onStop = new Subject<void>();

  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.mapAndCapitalize();
    this.tapAndCapitalize();
    this.getPostsWithLoadingSpinner();
    this.getPostsAndCommentsWithSwitchMap();
    this.sourceWithTakeWhile();
    this.sourceWithTakeLast();
    this.documentClickWithTakeUntil();
  }

  // Mapping and capitalizing
  mapAndCapitalize() {
    console.log('mapAndCapitalize');
    const source = of('artur');
    source.pipe(map((name) => name.toUpperCase())).subscribe((data) => {
      console.log('Name on subscribe:', data);
    });
  }

  // Tap and capitalize
  tapAndCapitalize() {
    console.log('tapAndCapitalize');
    const source = of('artur');
    source
      .pipe(tap((name) => name.toUpperCase()))
      .subscribe((data) => console.log('Name on subscribe:', data));
  }

  // Getting posts with two requests
  getPostsWithLoadingSpinner() {
    console.log('getPostsWithLoadingSpinner');
    const request = this.getPosts();
    this.setLoadingSpinner(request);

    request.subscribe((data) => {
      console.log(data);
    });
  }

  // Using switchMap to combine requests
  getPostsAndCommentsWithSwitchMap() {
    console.log('getPostsAndCommentsWithSwitchMap');
    const postsObs = this.getPosts();
    const commentObs = this.getComments();

    const combined = postsObs.pipe(
      switchMap((posts) => {
        return commentObs.pipe(
          tap((comments) => {
            console.log('comments: ', comments);
            console.log('posts: ', posts);
          })
        );
      })
    );

    combined.subscribe();
  }

  // Using takeWhile
  sourceWithTakeWhile() {
    console.log('sourceWithTakeWhile');
    let counter = 0;
    const source = of(1, 2, 3, 4);
    source.pipe(takeWhile(() => counter < 3)).subscribe(() => {
      console.log('Value with takeWhile', counter);
      counter++;
    });
  }

  // Using takeLast
  sourceWithTakeLast() {
    console.log('sourceWithTakeLast');
    const source = of(1, 2, 3, 4);
    source.pipe(takeLast(2)).subscribe((value) => {
      console.log('Value with takeLast', value);
    });
  }

  // Using takeUntil
  documentClickWithTakeUntil() {
    console.log('documentClickWithTakeUntil');
    const source = fromEvent(document, 'click');
    source
      .pipe(takeUntil(this.onStop))
      .subscribe(() => {
        console.log('Clicked on document!');
      })
  }

    // Setting a load spinner (one observable to get posts);
    setLoadingSpinner(observable: Observable<any>) {
      this.loading = true;
      observable.subscribe(() => (this.loading = false));
    }

    // Getting posts with share pipe
    getPosts(): Observable<any[]> {
      return this.http
        .get<any[]>('https://jsonplaceholder.typicode.com/posts')
        .pipe(share());
    }

    // Getting comments
    getComments(): Observable<any[]> {
      return this.http.get<any[]>(
        'https://jsonplaceholder.typicode.com/comments'
      );
    }

  stop() {
    this.onStop.next();
    this.onStop.complete();
  }
}
