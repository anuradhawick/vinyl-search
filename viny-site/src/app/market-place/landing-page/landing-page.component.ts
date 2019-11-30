import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { AuthService } from '../../shared-modules/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material';

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

const TREE_DATA: TreeNode[] = [
  {
    name: 'Records',
    children: [
      {name: 'Vinyl'},
      {name: 'Cassette'},
      {name: 'Other'},
    ]
  }, {
    name: 'Devices',
    children: [
      {name: 'Recorders'},
      {name: 'Players'},
      {name: 'Speakers'},
      {name: 'Mixers'},
      {name: 'Amplifiers'},
      {name: 'Other'},
    ]
  }
];

/** Flat node with expandable and level information */
interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  public records = null;
  public skip = 0;
  public limit = 30;
  public count = 0;
  public page = 1;
  public autocomplete = null;
  public _ = _;
  public query = null;
  @ViewChild('loader', {static: true}) loader: LoaderComponent;

  public treeControl = new FlatTreeControl<FlatNode>(
    node => node.level, node => node.expandable);

  public treeFlattener = new MatTreeFlattener(
    (node: TreeNode, level: number) => {
      return {
        expandable: !!node.children && node.children.length > 0,
        name: node.name,
        level: level,
      };
    }, node => node.level, node => node.expandable, node => node.children);

  public dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(public route: ActivatedRoute,
              private router: Router,
              public auth: AuthService) {
    this.dataSource.data = TREE_DATA;
    this.treeControl.expandAll();
  }

  ngOnInit() {
  }

  loadAutoComplete(event) {

  }

  search() {

  }

  exitSearch() {
    setTimeout(() => {
      this.autocomplete = null;
    }, 500);
  }


  hasChild = (_: number, node: FlatNode) => node.expandable;
}
