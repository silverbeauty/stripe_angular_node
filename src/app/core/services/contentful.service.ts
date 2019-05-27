import { Injectable } from '@angular/core';
import { createClient, Entry, EntryCollection } from 'contentful';

const CONFIG = {
  space: 'm4n2h3vkwtpu',
  accessToken: 'ca5ed1cdc03bac3e1fa5f434891fc1ee5d9949addfff9ac49b9183ae06de891a',

  contentTypeIds: {
    charity: 'charity',
    category: 'category',
    page: 'page'
  }
};

@Injectable()
export class ContentfulService {
  private cdaClient = createClient({
    space: CONFIG.space,
    accessToken: CONFIG.accessToken
  });

  constructor() { }

  getCharities(query?: object): Promise<Entry<any>[]> {
    return this.cdaClient.getEntries(Object.assign({
      content_type: CONFIG.contentTypeIds.charity
    }, query))
      .then(res => res.items);
  }

  getCharityDetail(charityId): Promise<Entry<any>> {
    return this.cdaClient.getEntries(Object.assign({
      content_type: CONFIG.contentTypeIds.charity
    }, { 'fields.slug': charityId}))
      .then(res => res.items[0]);
  }

  getFeaturedCharities(query?: object): Promise<Entry<any>[]> {
    return this.cdaClient.getEntries(Object.assign({
      content_type: CONFIG.contentTypeIds.charity
    }, { 'fields.featured': 'true' }))
      .then(res => res.items);
  }

  getCharitiesByCategory(query?: object): Promise<Entry<any>[]> {
    return this.cdaClient.getEntries(Object.assign({
      content_type: CONFIG.contentTypeIds.charity
    }, { 'fields.category.sys.id': query }))
      .then(res => res.items);
  }

  getCategories(query?: object): Promise<Entry<any>[]> {
    return this.cdaClient.getEntries(Object.assign({
      content_type: CONFIG.contentTypeIds.category
    }, query))
      .then(res => res.items);
  }

  getCategory(categoryId): Promise<Entry<any>> {
    return this.cdaClient.getEntries(Object.assign({
      content_type: CONFIG.contentTypeIds.category
    }, { 'sys.id': categoryId }))
      .then(res => res.items[0]);
  }

  getTextOnlyPage(slug): Promise<Entry<any>> {
    return this.cdaClient.getEntries(Object.assign({
      content_type: CONFIG.contentTypeIds.page
    }, { 'fields.slug': slug }))
    .then(res => res.items[0]);
  }

}
