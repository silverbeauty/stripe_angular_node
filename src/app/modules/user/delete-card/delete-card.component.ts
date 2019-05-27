import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-delete-card',
  templateUrl: './delete-card.component.html',
  styleUrls: ['./delete-card.component.css']
})
export class DeleteCardComponent implements OnInit {

  @Input() cards;
  @Input() selectedCard;
  selectedOption = 'deleteAll';
  availableCards = [];
  assignedCard;

  isProcessing = false;

  constructor(
    public activeModal: NgbActiveModal,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.availableCards = this.cards.filter(card => card.id !== this.selectedCard.id);
    this.assignedCard = this.availableCards[0] || null;
    this.isProcessing = false;
  }

  onDelete() {
    this.selectedOption = 'deleteAll';
  }

  onAssign() {
    this.selectedOption = 'assignCard';
  }

  onSelectCard(card) {
    this.assignedCard = card;
  }

  submit() {

    if(this.isProcessing) return;
    this.isProcessing = true;
    const isDelete = this.selectedOption === 'deleteAll' ? true : false;
    const assignedCard = this.selectedOption === 'deleteAll' ? null : this.assignedCard;
    const data = {
      isDelete: isDelete,
      card: this.selectedCard,
      assignedCard: assignedCard
    };
    this.userService.deleteCard(data).subscribe(res => {
      this.activeModal.dismiss('success');
      this.isProcessing = false;
    });
  }
}
