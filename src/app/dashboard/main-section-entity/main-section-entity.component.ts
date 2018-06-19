import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EntityService } from '../services/entity.service';
import { SchemaService } from '../services/schema.service';

@Component({
  selector: 'app-main-section-entity',
  templateUrl: './main-section-entity.component.html',
  styleUrls: ['./main-section-entity.component.scss']
})
export class MainSectionEntityComponent implements OnInit {

  icon: string;
  name: string;
  modeName: string;
  description: string;
  statuses: string[] = ['draft', 'waiting', 'approved', 'rejected'];
  status: string;
  formFields: any;
  formValues: any;
  schema: any;
  entity: any;
  schemaType: string;
  originalModeName: string;
  iff: string;
  icons: any[] = [{
    groupName: 'vehicles',
    list: ['airplane-front-view', 'air-station', 'balloon', 'boat', 'cargo-ship', 'car',
      'catamaran', 'convertible', 'drone', 'fighter-plane', 'fire-truck',
      'horseback-riding', 'motorcycle', 'railcar', 'railroad-train', 'rocket-boot',
      'sailing-boat', 'segway', 'shuttle', 'space-shuttle', 'steam-engine', 'suv',
      'tour-bus', 'tow-truck', 'transportation', 'trolleybus', 'water-transportation']
  }, {
    groupName: 'vehicles',
    list: ['airplane-front-view', 'air-station', 'balloon', 'boat', 'cargo-ship', 'car',
      'catamaran', 'convertible', 'drone', 'fighter-plane', 'fire-truck',
      'horseback-riding', 'motorcycle', 'railcar', 'railroad-train', 'rocket-boot',
      'sailing-boat', 'segway', 'shuttle', 'space-shuttle', 'steam-engine', 'suv',
      'tour-bus', 'tow-truck', 'transportation', 'trolleybus', 'water-transportation']
  }];

  iconsToDisplay: any[] = this.icons;
  dashRegex: RegExp = new RegExp(/-/g);
  showIconsBar: Boolean = false;

  filterIcons(str) {
    this.iconsToDisplay = this.icons.map(group => {
      let { groupName, list } = group;
      return {
        groupName,
        list: list.filter(icon => {
          return icon.includes(str);
        })
      };
    })
  }

  setIcon(icon) {
    setTimeout(() => {
      this.icon = icon;
      this.showIconsBar = false;
    }, 0)
  }

  toggleIconsBar(show) {
    setTimeout(() => {
      this.showIconsBar = show || Boolean(document.activeElement.closest('.icons-bar'));
    }, 0)
  }

  update() {
    // if originalModeName === '' it is a new mode
    this.entityService.update(this.entity._id, this.originalModeName, {
      icon: this.icon,
      name: this.name,
      description: this.description,
      iff: this.iff,
      modes: [{
        name: this.modeName,
        status: this.status,
        data: this.formValues
      }]
    }).subscribe((entity: any) => {
      this.router.navigate([this.schemaType, entity._id, this.modeName]);
      this.entityService.subject.next({
        action: this.originalModeName === '' ? 'new mode' : 'update mode',
        mode: entity.modes.find(e => e.name === this.modeName)
      });
    });
  }

  save() {
    if (this.entity) return this.update(); 
    this.entityService.save({
      icon: this.icon,
      schema: this.schema._id,
      category: this.schema.category,
      name: this.name,
      description: this.description,
      iff: this.iff,
      modes: [{
        name: this.modeName,
        status: this.status,
        data: this.formValues
      }]
    }).subscribe((entity: any) => {
      this.router.navigate([this.schemaType, entity._id, entity.modes[0].name]);
      this.entityService.subject.next({
        action: 'new entity',
        entity: entity
      });
    });
  }

  cancel() {
    this.initInitialValues(this.schema, this.entity)
  }

  delete() {
    // this.entityService.delete('1')
  }

  constructor(
    private entityService: EntityService,
    private route: ActivatedRoute,
    private schemaService: SchemaService,
    private router: Router
   ) { }


  initInitialValues(schema, entity?) {
    this.schema = schema;
    entity = entity || {};
    entity.modes = entity.modes || [{}];
    let mode = entity.modes[0];
    this.icon = entity.icon || 'drone';
    this.name = entity.name || '';
    this.modeName = mode.name || '';
    this.originalModeName = this.modeName;
    this.iff = entity.iff || 'foe';
    this.status = mode.status || 'draft';
    this.description = entity.description || '';
    this.formFields = schema.fields;
    this.formValues = Object.assign({}, mode.data);
  }

  initExistsEntity(params) {
    this.entityService.findOne(params.entityId, params.modeName).subscribe((entity: any) => {
      this.entity = entity;
      this.initInitialValues(entity._schema, entity);
    });
  }

  initNewEntity(category) {
    this.schemaService.find(this.schemaType, category).subscribe(schema => {
      this.initInitialValues(schema[0]);
    });
  }
  
  ngOnInit() {
    this.route.parent.params.subscribe(pParams => {
      this.schemaType = pParams.type;
      this.route.params.subscribe(params => {
        if (params.entityId) return this.initExistsEntity(params);
        this.initNewEntity(params.category);
      });
    });
  }
}
