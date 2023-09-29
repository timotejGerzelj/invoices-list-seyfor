import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map } from 'rxjs';
import { Article } from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = 'http://localhost:5102/api/Article'
  constructor(private http: HttpClient) { }

  private articleSubject = new BehaviorSubject<Article[]>([]);
  artikli: Article[] = [];
  getAllArtikli(): void {
    if (this.artikli.length === 0){

    
    this.http.get<Article[]>(this.apiUrl)
      .pipe(
        catchError((error) => {
          console.error('Get All Tasks Error:', error);
          throw error; 
        })
      )
      .subscribe((artikli) => {
        this.artikli = artikli;
        this.articleSubject.next(artikli);
      });
    }
  }

}
